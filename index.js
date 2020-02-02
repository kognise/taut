const { RTMClient } = require('@slack/rtm-api')
const { WebClient } = require('@slack/web-api')
const fs = require('fs')

const config = require('./config')
const { aliases, commands } = require('./controller')
const { validateConfig } = require('./schema')

const stats = fs.existsSync(config.statsFile)
  ? JSON.parse(fs.readFileSync(config.statsFile))
  : {}
const saveStats = () => fs.writeFileSync(config.statsFile, JSON.stringify(stats))

const launchBot = async (token, commandRegex) => {
  const rtm = new RTMClient(token)
  const web = new WebClient(token)

  const { self, team } = await rtm.start()
  const startup = Date.now()
  console.log(`> Bot started in ${team.name} (${team.id})`)

  if (!stats[team.id]) {
    stats[team.id] = {
      lastMessage: 0,
      messages: 0,
      userMessages: 0,
      botMessages: 0
    }
    saveStats()
  }

  rtm.on('message', async (event) => {
    if (event.subtype) return

    stats[team.id].messages++
    if (event.user === self.id) {
      stats[team.id].userMessages++
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
    
    const ratelimited = Date.now() - stats[team.id].lastMessage < config.timeout
    if (ratelimited || event.user === self.id) return

    for (let { match, responses, response, blacklistedChannels } of config.automations) {
      if (match.test(event.text)) {
        if (responses) {
          response = responses[Math.floor(Math.random() * responses.length)]
        }

        if (blacklistedChannels && blacklistedChannels.includes(event.channel)) {
          saveStats()
          return
        }

        await web.chat.postMessage({
          channel: event.channel,
          thread_ts: event.thread_ts,
          text: response,
          as_user: true
        })

        stats[team.id].botMessages++
        stats[team.id].userMessages++
        stats[team.id].lastMessage = Date.now()

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
} else {
  console.log(`> There are ${problems.length} problems with your config:`)
  console.log(problems.map((problem) => `- ${problem}`).join('\n'))
}