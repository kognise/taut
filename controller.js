const { getDoxBlocks, getStatsBlocks } = require('./blocks')

const userRegex = /<@([UW][A-Z0-9]{8})>/

module.exports.aliases = {
  uinfo: 'dox',
  userinfo: 'dox',
  info: 'dox',
  user: 'dox',
  score: 'suspicionscore',
  sus: 'suspicionscore',
  spamscore: 'suspicionscore'
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

  suspicionscore: async ({ body, event, web, stats, saveStats, team, config }) => {
    const matches = body.match(userRegex)
    const user = matches ? matches[1] : event.user
    const isSender = user === event.user

    const suspicionScore = stats.shadowbanning[user] ? stats.shadowbanning[user].score : 0
    const shadowbanned = suspicionScore >= config.shadowbanThreshold

    if (config.shadowbanThreshold === -1) {
      await web.chat.postMessage({
        channel: event.channel,
        thread_ts: event.thread_ts,
        text: `:warning: Shadowbanning isn't enabled for ${config.name}.`,
        as_user: true
      })
    } else {
      await web.chat.postMessage({
        channel: event.channel,
        thread_ts: event.thread_ts,
        text: `${shadowbanned ? ':angry:' : ':hatched_chick:'} ${isSender ? 'Your' : 'Their'} suspicion score is *${suspicionScore}* out of the *${config.shadowbanThreshold}* required to be shadowbanned.`,
        as_user: true
      })
    }

    stats.messages[team.id].botMessages++
    saveStats()
    return true
  }
}