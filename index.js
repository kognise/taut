const { RTMClient } = require('@slack/rtm-api')
const { WebClient } = require('@slack/web-api')
const fs = require('fs')

const config = require('./config')
const { aliases, commands } = require('./controller')
const { validateConfig } = require('./schema')

const stats = fs.existsSync(config.statsFile)
  ? JSON.parse(fs.readFileSync(config.statsFile))
  : {
    messages: {},
    shadowbanning: {}
  }
const saveStats = () => fs.writeFileSync(config.statsFile, JSON.stringify(stats))

const launchBot = async (token, commandRegex) => {
  const rtm = new RTMClient(token)
  const web = new WebClient(token)

  const { self, team } = await rtm.start()
  const startup = Date.now()
  console.log(`> Bot started in ${team.name} (${team.id})`)

  if (!stats.messages[team.id]) {
    stats.messages[team.id] = {
      lastMessage: 0,
      messages: 0,
      userMessages: 0,
      botMessages: 0
    }
    saveStats()
  }

  rtm.on('message', async (event) => {
    if (event.subtype) return

    stats.messages[team.id].messages++
    if (event.user === self.id) {
      stats.messages[team.id].userMessages++
    }

    const matches = event.text.trim().match(commandRegex)
    if (matches) {
      const trigger = matches[1].toLowerCase().trim()
      const body = matches[2].trim()

      const data = {
        body, event, web,
        stats, saveStats,
        config, self, team,
        startup
      }

      let fine = false
      if (aliases[trigger]) {
        fine = commands[aliases[trigger]](data)
      } else if (commands[trigger]) {
        fine = commands[trigger](data)
      }

      if (fine) {
        console.log(`> ${config.prefix}${trigger} command completed`)
        saveStats()
        return
      }
    }
    
    const ratelimited = Date.now() - stats.messages[team.id].lastMessage < config.timeout
    if (event.user === self.id) return

    let gotFirstMatch = false
    for (let { match, responses, response, blacklistedChannels } of config.automations) {
      const matches = match.test(event.text)
      if (!matches) continue

      if (stats.shadowbanning[event.user]) {
        const tracked = stats.shadowbanning[event.user]

        if (Date.now() - tracked.lastMessage >= 300000 && tracked.score >= config.shadowbanThreshold + 10) {
          tracked.score = 2
        }

        let newScore = ratelimited ? 2 : 3

        if (Date.now() - tracked.lastTrigger < 5000) {
          newScore += 2
        }

        if (tracked.lastMessage.toLowerCase().replace(/\s+/g, '') === event.text.toLowerCase().replace(/\s+/g, '')) {
          newScore--
        }

        if (gotFirstMatch) {
          newScore--
        }

        tracked.lastTrigger = Date.now()
        tracked.lastMessage += event.text
        tracked.score += newScore
      } else {
        stats.shadowbanning[event.user] = {
          lastTrigger: Date.now(),
          lastMessage: event.text,
          score: 1
        }
      }

      const suspicionScore = stats.shadowbanning[event.user].score
      if (config.shadowbanThreshold !== -1 && suspicionScore >= config.shadowbanThreshold) {
        const info = await web.users.info({ user: event.user })
        console.log(`> User ${info.user.real_name} seems to be spamming the bot and is shadowbanned`)

        saveStats()
        return
      }

      if (ratelimited || gotFirstMatch) continue
      gotFirstMatch = false
      if (match.test(event.text)) {
        if (responses) {
          response = responses[Math.floor(Math.random() * responses.length)]
        }

        if (
          (blacklistedChannels && blacklistedChannels.includes(event.channel))
          || (
            config.blacklistedAutomationChannels
            && config.blacklistedAutomationChannels.includes(event.channel)
          )
        ) {
          saveStats()
          return
        }

        await web.chat.postMessage({
          channel: event.channel,
          thread_ts: event.thread_ts,
          text: response,
          as_user: true
        })

        stats.messages[team.id].botMessages++
        stats.messages[team.id].lastMessage = Date.now()

        saveStats()
        return
      }
    }
    
    saveStats()
  })
}

const problems = validateConfig(config)
if (problems.length === 0) {
  console.log('> Config appears to be valid')

  const escapedPrefix = [ ...config.prefix ].map((character) => `\\${character}`)
  const commandRegex = new RegExp(`^${escapedPrefix}(.+?)(\\s+.+$|$)`, 'i')
  console.log(`> Command regex is ${commandRegex}`)

  for (let token of config.tokens) {
    launchBot(token, commandRegex)
  }
} else if (problems.length === 1) {
  console.log('> One problem was found with your config:')
  console.log(problems[0])
  process.exit(1)
} else {
  console.log(`> There are ${problems.length} problems with your config:`)
  console.log(problems.map((problem) => `- ${problem}`).join('\n'))
  process.exit(1)
}