const { getCoronaStats } = require('./corona')
const { getDoxBlocks, getStatsBlocks, getCoronaBlocks } = require('./blocks')

const userRegex = /<@([UW][A-Z0-9]{8-10})>/

module.exports.aliases = {
  uinfo: 'dox',
  userinfo: 'dox',
  info: 'dox',
  user: 'dox',
  corona: 'coronavirus',
  coronastats: 'coronavirus',
  coronastatus: 'coronavirus'
}

module.exports.commands = {
  stats: async ({ event, web, stats, saveStats, config, self, team, startup }) => {
    if (event.user !== self.id) return false

    await web.chat.postMessage({
      channel: event.channel,
      thread_ts: event.thread_ts,
      attachments: [
        {
          color: config.color,
          blocks: getStatsBlocks(config, startup, stats, team)
        }
      ],
      as_user: true
    })

    stats.messages[team.id].botMessages++
    saveStats()
    return true
  },

  dox: async ({ body, event, web, stats, saveStats, config, self, team }) => {
    const matches = body.match(userRegex)
    if (matches && event.user !== self.id) return false
    console.log('matched!')
    const user = matches ? matches[1] : event.user

    let info 
    try {
      info = await web.users.info({ user })
    } catch (error) {
      info = {
        ok: false,
        error: error.message
      }
    }

    if (!info.ok) {
      await web.chat.postMessage({
        channel: event.channel,
        thread_ts: event.thread_ts,
        text: `:warning: ${info.error}`,
        as_user: true
      })
    } else {
      await web.chat.postMessage({
        channel: event.channel,
        thread_ts: event.thread_ts,
        attachments: [
          {
            color: config.color,
            blocks: getDoxBlocks(info.user)
          }
        ],
        as_user: true
      })
    }

    stats.messages[team.id].botMessages++
    saveStats()
    return true
  },

  coronavirus: async ({ event, web, stats, saveStats, team, config }) => {
    const coronaStats = await getCoronaStats()

    await web.chat.postMessage({
      channel: event.channel,
      thread_ts: event.thread_ts,
      attachments: [
        {
          color: config.color,
          blocks: getCoronaBlocks(coronaStats)
        }
      ],
      as_user: true
    })

    stats.messages[team.id].botMessages++
    saveStats()
    return true
  },

  pardon: async ({ body, event, web, stats, saveStats, team, self }) => {
    const matches = body.match(userRegex)
    if (self.id !== event.user || !matches) return

    if (stats.shadowbanning[matches[1]]) {
      stats.shadowbanning[matches[1]].score = 0
    }

    await web.chat.postMessage({
      channel: event.channel,
      thread_ts: event.thread_ts,
      text: `:100: Cleared <@${matches[1]}>'s suspicion score, if they had one.`,
      as_user: true
    })

    stats.messages[team.id].botMessages++
    saveStats()
    return true
  }
}