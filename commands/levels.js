const { Servers } = require('../dbObjects');
const { warning, okay } = require('../colors.json');
const Discord = require('discord.js');

function StringReplace(inString, serverName, url) {
  let retString = inString;
  if (inString.includes('%server_name%')) {
    retString = retString.replace(/%server_name%/g, `${serverName}`);
  }
  if (inString.includes('%url%')) {
    retString = retString.replace(/%url%/g, `${url}`);
  }
  return retString;
}

module.exports = {
  name: 'levels',
  description: 'Returns a url to the servers leaderboard',
  async execute(message) {
    const currentServer = await Servers.findOne({ where: { server_id: message.guild.id } });
    const embed = new Discord.MessageEmbed().setTimestamp();

    if (!currentServer) {
      embed.setColor(warning)
        .setDescription('This server is not being tracked right now, if this is in error contact Dashwav')
        .setTitle('Unsuccessful');
      message.channel.send({ embed });
      return;
    }
    const toReturn = StringReplace(currentServer.levels_string, currentServer.server_name, `https://www.danbo.space/leaderboards/${currentServer.server_id}`);
    embed.setColor(okay)
      .setDescription(toReturn)
      .setTitle('Leaderboards');
    message.channel.send({ embed });
  },
};

