const humanize = require('humanize-duration')

module.exports.getStatsBlocks = (config, startup, stats, team) => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:slack: *${config.name} Statistics* (${team.name})`
    }
  },
  {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `:clock1: Uptime: *${humanize(Date.now() - startup, { conjunction: ' and ', largest: 2 })}*`
      },
      {
        type: 'mrkdwn',
        text: `:eyes: Messages: *${stats.messages[team.id].messages}*`
      },
      {
        type: 'mrkdwn',
        text: `:sunglasses: Your Messages: *${stats.messages[team.id].userMessages}*`
      },
      {
        type: 'mrkdwn',
        text: `:robot_face: My Messages: *${stats.messages[team.id].botMessages} (${Math.round((stats.messages[team.id].botMessages / stats.messages[team.id].userMessages) * 100)}%)*`
      }
    ]
  }
]

module.exports.getDoxBlocks = (info) => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:tada: *Info on <@${info.id}>*`
    }
  },
  {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `Name: *${info.real_name}*`
      },
      {
        type: 'mrkdwn',
        text: `Timezone: *${info.tz_label}*`
      },
      {
        type: 'mrkdwn',
        text: `Email: *${info.profile.email || 'N/A'}*`
      },
      {
        type: 'mrkdwn',
        text: `Phone #: *${info.profile.phone || 'N/A'}*`
      },
      {
        type: 'mrkdwn',
        text: `Title: *${info.profile.title || 'N/A'}*`
      },
      {
        type: 'mrkdwn',
        text: `Status: *${info.profile.status_emoji ? info.profile.status_emoji + ' ' : ''}${info.profile.status_text || 'N/A'}*`
      }
    ],
    accessory: {
      type: 'image',
      image_url: info.profile.image_192,
      alt_text: `${info.name}'s avatar`
    }
  }
]