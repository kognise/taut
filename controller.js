const { getDoxBlocks, getStatsBlocks } = require('./blocks')

const userRegex = /<@([UW][A-Z0-9]{8})>/

module.exports.aliases = {
  uinfo: 'dox',
  userinfo: 'dox',
  info: 'dox',
  user: 'dox'
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

    saveStats()
    return true
  },

  dox: async ({ body, event, web, saveStats, config, self }) => {
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

    saveStats()
    return true
  }
}