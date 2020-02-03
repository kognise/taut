const tokenLink = 'https://api.slack.com/legacy/custom-integrations/legacy-tokens'
const tokenRegex = /^xoxp-[0-9]{10,12}-[0-9]{10,12}-[0-9]{10,12}-[a-z0-9]{32}$/i
const colorRegex = /^#[a-f0-9]{6}$/i
const channelRegex = /^C[A-Z0-9]{8}$/

module.exports.validateConfig = (config) => {
  const problems = []

  if (!Array.isArray(config.tokens)) {
    problems.push('tokens must be an array')
  } else if (config.tokens.length < 1) {
    problems.push(`tokens should have one or more tokens. you can generate a token at ${tokenLink}`)
  } else  {
    for (let i = 0; i < config.tokens.length; i++) {
      if (!tokenRegex.test(config.tokens[i])) {
        problems.push(`tokens[${i}] doesn't look like a valid token. you can generate one at ${tokenLink}`)
      }
    }
  }

  if (typeof config.name !== 'string') {
    problems.push('name must be a string')
  } else if (config.name.length < 2) {
    problems.push('name should be two or more characters long')
  }

  if (typeof config.prefix !== 'string') {
    problems.push('prefix must be a string')
  } else if (config.prefix.length < 1) {
    problems.push('prefix should be one or more characters long')
  }

  if (typeof config.color !== 'string') {
    problems.push('color must be a string')
  } else if (!colorRegex.test(config.color)) {
    problems.push(`color doesn't look like a valid hex color`)
  }

  if (typeof config.timeout !== 'number') {
    problems.push(`timeout must be a number. if you don't want ratelimiting set it to 0`)
  } else if (config.timeout < 0) {
    problems.push('timeout must be 0 or higher')
  }

  if (typeof config.shadowbanThreshold !== 'number') {
    problems.push(`shadowbanThreshold must be a number. if you don't want shadowbanning set it to -1`)
  } else if (config.shadowbanThreshold < 6 && config.shadowbanThreshold !== -1) {
    problems.push('shadowbanThreshold must be 6 or higher, or -1 to disable shadowbanning')
  }

  if (typeof config.statsFile !== 'string') {
    problems.push('statsFile must be a string')
  } else if (config.statsFile.length < 1) {
    problems.push('statsFile should be one or more characters long')
  }

  if (config.blacklistedAutomationChannels) {
    if (!Array.isArray(config.blacklistedAutomationChannels)) {
      problems.push('blacklistedAutomationChannels must be an array')
    } else {
      for (let i = 0; i < config.blacklistedAutomationChannels.length; i++) {
        const channel = config.blacklistedAutomationChannels[i]

        if (typeof channel !== 'string') {
          problems.push(`blacklistedAutomationChannels[${i}] must be a string`)
        } else if (!channelRegex.test(channel)) {
          problems.push(`blacklistedAutomationChannels[${i}] doesn't look like a valid channel id`)
        }
      }
    }
  }

  if (!Array.isArray(config.automations)) {
    problems.push(`automations must be an array. if you don't want any automations make an empty array`)
  } else {
    for (let i = 0; i < config.automations.length; i++) {
      const automation = config.automations[i]
      if (typeof automation !== 'object' || Array.isArray(automation)) {
        problems.push(`automations[${i}] must be an object`)
        continue
      }

      if (!(automation.match instanceof RegExp)) {
        problems.push(`automations[${i}].match must be a regex`)
      }

      if (automation.response && typeof automation.response !== 'string') {
        if (Array.isArray(automation.response)) {
          problems.push(`automations[${i}].response must be a string. did you mean to set automations[${i}].responses?`)
        } else {
          problems.push(`automations[${i}].response must be a string`)
        }
      } else if (automation.response && automation.responses) {
        problems.push(`you may not have both automations[${i}].response and automations[${i}].responses at the same time`)
      } else if (automation.responses && !Array.isArray(automation.responses)) {
        problems.push(`automations[${i}].responses must be an array`)
      } else if (automation.responses) {
        for (let j = 0; j < automation.responses.length; j++) {
          if (typeof automation.responses[j] !== 'string') {
            problems.push(`automations[${i}].responses[${j}] must be a string`)
          } else if (automation.responses[j].length < 1) {
            problems.push(`automations[${i}].responses[${j}] should be one or more characters long`)
          }
        }
      } else if (!automation.response && !automation.responses) {
        problems.push(`you must have either automations[${i}].response or automations[${i}].responses`)
      }

      if (automation.blacklistedChannels) {
        if (!Array.isArray(automation.blacklistedChannels)) {
          problems.push(`automations[${i}].blacklistedChannels must be an array`)
        } else {
          for (let j = 0; j < automation.blacklistedChannels.length; j++) {
            const channel = automation.blacklistedChannels[j]

            if (typeof channel !== 'string') {
              problems.push(`automations[${i}].blacklistedChannels[${j}] must be a string`)
            } else if (!channelRegex.test(channel)) {
              problems.push(`automations[${i}].blacklistedChannels[${j}] doesn't look like a valid channel id`)
            }
          }
        }
      }
    }
  }

  return problems
}