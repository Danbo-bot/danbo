# danbo [![Build Status](https://travis-ci.com/Danbo-bot/danbo.svg?branch=master)](https://travis-ci.com/Danbo-bot/danbo)
Dead simple discord experience bot

# Invite
[Click here](https://www.danbo.space/) for the Danbo website with the leaderboards <https://www.danbo.space/leaderboards/your-guild-id>
[Click here](https://discordapp.com/oauth2/authorize?client_id=460722914711568395&scope=bot&permissions=268823744) to invite Yin-bot to your server

# Development

Development with Danbo is a very simple process.

Requirements:
```
Java-JDK ^9.0
node ^12
postgresql ^11
```

Steps to run:

* Clone repo (duh)
* Copy example-config.json to config.json and edit values as needed.
* Create a directory for the db
* Run `npm install`
* Run `postgresql -D ./db -p 5432`
* Run `node dbInit.js` to initialize the db
* Run `node danbo.js` to start the bot.
* Invite bot to server.

## Common Issues:
