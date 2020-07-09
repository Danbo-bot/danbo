const Discord = require('discord.js');
const { black } = require('../colors.json');

module.exports = {
  name: 'ping',
  description: 'Ping...Pong!',

  execute(message) {
    const embed = new Discord.MessageEmbed()
      .setTimestamp()
      .setColor(black)
      .setTitle('Ping!')
      .setDescription('Pong!', `${new Date().getTime() - message.createdTimestamp} ms`, true);

    message.channel.send({ embed });
  },
};
