const { prefix } = require('../config.json');
const Discord = require('discord.js');
const { alert, okay } = require('../colors.json');

module.exports = {
  name: 'help',
  description: 'Get info in a command or list all commands. If dm present, will DM you instead of sending to channel',
  aliases: ['h', 'command', 'commands'],
  usage: '(blank)/command (blank)/dm',

  execute(message, args) {
    let toReply = '';
    const { commands } = message.client;
    const sendToDm = (args.indexOf('dm') > -1);
    const embed = new Discord.MessageEmbed().setTimestamp();

    // if no arguments, send all commands to DM
    if (!args.length || (args.length === 1 && sendToDm)) {
      embed.setTitle('**Commands**')
        .setColor(okay)
        .setDescription(commands.map(command => command.name).join(', '));

      if (sendToDm) {
        return message.author.send({ embed })
          .then(sent => {
            embed.fields = null;
            embed.setTitle('Success').setDescription(`I've sent you a DM!`);
            message.reply({ embed });
            })
          .catch();
      }
      return message.channel.send({ embed });
    }
    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.findOne(c =>
      c.aliases && c.aliases.includes(name));

    // if not a command and don't send to dm then invalid
    if (!command && !sendToDm) {
      embed.setTitle('That\'s not a valid command!').setColor(alert);
      return message.reply({ embed });
    }

    toReply += `**Name:** ${command.name}\n`;

    if (command.aliases) { toReply += `**Aliases:** ${command.aliases.join(', ')}\n`; }
    if (command.description) { toReply += `**Description:** ${command.description}\n`; }
    if (command.usage) { toReply += `**Usage:** ${prefix}${command.name} ${command.usage}\n`; }
    if (command.cooldown) { toReply += `**Cooldown:** ${command.cooldown || 3} second(s)\n`; }

    embed.setTitle('**Command Info**').setDescription(toReply).setColor(okay);

    // if command found and send to dm, sends user a dm
    if (sendToDm) {
      return message.author.send({ embed })
        .then(sent => {
          embed.fields = null;
          embed.setTitle('Success').setDescription(`I've sent you a DM!`);
          message.reply({ embed });
          })
        .catch();
    // else command is found send it to channel
    }
    return message.channel.send({ embed });
  },
};
