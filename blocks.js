const humanize = require('humanize-duration')

const formatNumber = (number) => {
  return [ ...number.toString() ].reduce((p, c, i) => {
    if ((i - number.toString().length % 3) % 3 === 0 && i !== 0) {
      return p + ',' + c
    } else return p + c
  }, '')
}

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
        text: `:eyes: Messages: *${formatNumber(stats.messages[team.id].messages)}*`
      },
      {
        type: 'mrkdwn',
        text: `:sunglasses: Your Messages: *${formatNumber(stats.messages[team.id].userMessages)}*`
      },
      {
        type: 'mrkdwn',
        text: `:robot_face: My Messages: *${formatNumber(stats.messages[team.id].botMessages)} (${Math.round((stats.messages[team.id].botMessages / stats.messages[team.id].userMessages) * 100)}%)*`
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

module.exports.getCoronaBlocks = (stats) => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `
:eyes: *COVID-19 Status*
It's been spreading for around ${humanize(stats.timeSinceStart, { conjunction: ' and ', largest: 2 })}. Yoinks!
      `.trim()
    }
  },
  {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `:mask: Confirmed Cases: *${formatNumber(stats.confirmedCases)}*`
      },
      {
        type: 'mrkdwn',
        text: `:skull: Deaths: *${formatNumber(stats.deaths)}*`
      },
      {
        type: 'mrkdwn',
        text: `:muscle: Recoveries: *${formatNumber(stats.recovered)}*`
      },
      {
        type: 'mrkdwn',
        text: `:minibus: Regions: *${formatNumber(stats.affectedRegions)}*`
      }
    ]
  }
]