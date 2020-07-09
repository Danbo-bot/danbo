const Discord = require('discord.js');
const { Blacklisted, Servers } = require('../dbObjects');
const { alert, warning, okay } = require('../colors.json');

module.exports = {
  name: 'blacklist',
  description: 'Returns the reward ranks for a server, allows one to add more',
  usage: '<add/remove> <rolename: str> <levelGained: int>',

  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      console.log('Bot does not have correct permissions');
      return;
    }
    const embed = new Discord.MessageEmbed().setTimestamp();

    if (args.length === 0) {
      Blacklisted.findAll({
        where:
        { server_id: message.guild.id },
      }).then((serverBlacklisted) => {
        let returnString = '';
        serverBlacklisted.forEach((value) => {
          returnString += `\`${value.role_name}\`\n`;
        });
        embed.setTitle(`Blacklisted roles for ${message.guild.name}`)
          .setDescription(returnString).setColor(okay);
        message.channel.send({ embed });
      });
    }

    if (args[0] === 'add') {
      if (args.length < 2) {
        embed.setDescription('Not enough arguments')
          .setColor(warning);

        message.channel.send({ embed });
        return;
      }

      const tempRole = message.guild.roles.cache.find((role) => role.name === args[1]);

      if (!tempRole) {
        embed.setDescription('No Role Found')
          .setColor(warning);

        message.channel.send({ embed });
        return;
      }

      Blacklisted.create({
        role_id: tempRole.id,
        role_name: tempRole.name,
        server_id: message.guild.id,
      }).then((newReward) => {
        const thisServer = Servers.findOrCreate({
          where: { server_id: message.guild.id },
          defaults: { remove_roles: false },
        });
        newReward.setServer(thisServer);

        embed.setTitle('New blacklist role created')
          .setDescription(`**Role Name:** ${args[1]}\n**Role ID:** ${newReward.role_id}\n`)
          .setColor(okay);

        message.channel.send({ embed });
      });
    } else if (args[0] === 'rem' || args[0] === 'remove') {
      if (args.length < 2) {
        embed.setDescription('Not enough arguments')
          .setColor(warning);

        message.channel.send({ embed });
        return;
      }

      const tempRole = message.guild.roles.cache.find((role) => role.name === args[1]);
      if (!tempRole) {
        embed.setDescription('No Role Found')
          .setColor(warning);

        message.channel.send({ embed });
        return;
      }
      Blacklisted.destroy({
        where: {
          role_id: tempRole.id,
        },
      }).then((success) => {
        if (success === 0) {
          embed.setDescription('Error with removing role')
            .setColor(alert);

          message.channel.send({ embed });
          return;
        }
        Blacklisted.findAll({
          where: {
            server_id: message.guild.id,
          },
        }).then((allBlacklisted) => {
          let returnString = `Current blacklist roles for ${message.guild.name}:\n`;
          allBlacklisted.forEach((value) => {
            returnString += `\`${value.role_name}\`\n`;
          });
          embed.setTitle(`Successfully deleted the blacklist role ${args[1]}`)
            .setColor(okay).setDescription(returnString);
          message.channel.send({ embed });
        });
      });
    }
  },
};
