const { black } = require('../colors.json');
const Discord = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Ping...Pong!',

  execute(message) {
    const embed = new Discord.RichEmbed()
      .setTimestamp()
      .setColor(black)
      .setTitle('Ping!')
      .setDescription('Pong!', `${new Date().getTime() - message.createdTimestamp} ms`, true);

    message.channel.send({ embed });
  },
};
