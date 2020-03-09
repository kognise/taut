<div align='center'>
  <h1><img src='readme-banner.png' alt='Taut'></h1>
  <p>🤖 The best selfbot for Slack</p>
</div>

## What is this?

Taut is a self-bot for Slack. That means it can act like you and in many cases can't be distinguished from a human. This specific bot is primarily designed to act on triggers and impersonate you, but it also has various other features outlined below.

Have any questions? Feel free to create an issue on GitHub.

## Setup

Currently, you'll need Node.js and Git installed to run Taut. If anyone else wants to use it I'll consider making it easier to run.

```
$ git clone https://github.com/kognise/taut.git
$ cd taut/
$ yarn
```

Next create the file `config.js`. This is the main configuration file. Unless you're very technically I recommend pasting the contents of [`default-config.js`](https://github.com/kognise/taut/blob/master/default-config.js) in for some default values.

Go to [Slack's legacy tokens page](https://api.slack.com/custom-integrations/legacy-tokens) and generate tokens for all the workspaces you want to use Taut in. Then paste the tokens one by one into the `tokens` array in the config, like so:

```js
module.exports = {
  tokens: [
    'xoxp-etcetera'
  ],

  // ...
}
```

Now run `yarn start` to start the bot! If all went well everything should be working.

## Commands

Right now Taut only supports 5 commands, contributions are welcome. Arguments in square brackets are optional and arguments in angle brackets are required.

| Command               | Description                                                      | Aliases                           |
| :-------------------: | :--------------------------------------------------------------: | :-------------------------------: |
| stats                 | Get info about the bot and current workspace                     | N/A                               |
| dox [user]            | Get the profile of either the mentioned user or yourself         | uinfo, info, user                 |
| pardon <user>         | Clears the suspicion score of a user, if you're the bot owner    | N/A                               |
| coronavirus           | Get statistics on the new Coronavirus (2019-nCoV)                | corona, coronastats, coronastatus |

There used to be a command to get your suspicion score, that's been removed due to excessive spam.

## Spam Prevention

This bot is primarily designed to pretend to be real person which means it needs strong spam prevention to stay realistic and not be a nuisance.

Taut will analyze every message and use an algorithm to generate a score for each user on how likely they are to be trying to spam with the bot. By default Taut will automatically "shadowban" (silently stop responding to) users that exceed a certain score threshold.

You can update the threshold with the configuration value `shadowbanThreshold`, or set it to `-1` to disable shadowbanning. Scores will be reset generally around 2 minutes which is often enough for people to cool down.

Taut can also ratelimit itself, the minimum amount of time between bot messages can be adjusted with `timeout` in the config.

## Automation

As I've mentioned before, Taut's primary purpose is automation. It therefore has a hugely powerful system for pretending to you which might take some getting used to. Lo and behold...

### Writing Automation Rules

Automation rules go under `automations` in the config file. It's an array of JavaScript objects. Here's a simple rule that replies with 👀 anytime someone sends exactly 👀:

```js
module.exports = {
  // ...

  automations: [
    {
      match: /^:eyes:$/,
      response: ':eyes:'
    }
  ]
}
```

The `match` field takes a regex, or regular expression. If you aren't familiar, I recommend [learning regexes](https://regexone.com/) and [testing out your own regexes](https://regex101.com/). A tip that might come in handy - if you want a regex to not be case-sensitive just put `i` after the last slash, like `/regex/i`.

### Vary Your Responses

The automation I've shown so far has a `response` field, which is fine for most automations! But if you want to be more realistic, you might want Taut to pick a random response from a list, this is where `responses` comes in.

Below is a rule that'll reply to greetings (hello, hi, etc.) with a random response from a list of responses. It's fine if you don't understand the regex!

```js
module.exports = {
  // ...

  automations: [
    {
      match: /^(he[lw]{2}o|hey+|hi+|yo|oy|sup)$/i,
      responses: [ 'heyo!', 'hey!', 'hiii', 'oy', ':wave:' ]
    }
  ]
}
```

### Icky Channels

Some of your automations might not be appropriate in channels, or you might want to ban some channels altogether! This is where two new configuration options come in.

Per-rule, you can set `rule.blacklistedChannels` to a list of blacklisted channel ids.

For channels you want to block for all automations, you can add them to `blacklistedAutomationChannels` in the root of the config. To get a channel id, right click on a channel and choose `Copy Link`, then remove everything before the last segment.

## More Configuration

Here's a quick run-down of other config options I might've missed:

- `name` sets the name of your bot
- `prefix` sets the prefix for commands, I recommend setting it to something different from other bots
- `color` sets the left border color for embeds
- `statsFile` sets the file to save message and user stats, don't bother changing this

## Credits

Right now I'm the only contributor, although as I've mentioned a million times contributions are welcome. Shoutout to Max for the original inspiration with his selfbot [Slacky](https://github.com/M4cs/Slacky).