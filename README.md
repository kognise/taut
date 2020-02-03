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

Right now Taut only supports 3 commands, contributions are welcome. Arguments in square brackets are optional and arguments in angle brackets are required.

| Command               | Description                                                      | Aliases               |
| :-------------------: | :--------------------------------------------------------------: | :-------------------: |
| stats                 | Get info about the bot and current workspace                     | N/A                   |
| dox [user]            | Get the profile of either the mentioned user or yourself         | uinfo, info, user     |
| suspicionscore [user] | Get the shadowban score of either the mentioned user or yourself | score, spamscore, sus |

## Credits

Right now I'm the only contributor, although as I've mentioned a million times contributions are welcome. Shoutout to Max for the original inspiration with his selfbot [Slacky](https://github.com/M4cs/Slacky).