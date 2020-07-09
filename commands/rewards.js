const Discord = require('discord.js');
const { Rewards, Servers } = require('../dbObjects');
const { alert, warning, okay } = require('../colors.json');
const { prefix } = require('../config.json');

module.exports = {
  name: 'rewards',
  description: 'Returns the reward ranks for a server, allows one to add more',
  usage: '<add/remove> <rolename: str> <levelGained: int>',

  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_ROLES')) { return; }
    const embed = new Discord.MessageEmbed().setTimestamp();

    if (args.length === 0) {
      Rewards.findAll({
        where:
        { server_id: message.guild.id },
      }).then((serverRewards) => {
        let returnString = `There are no rewards for this server - add them with \`${prefix}rewards add <role>\``;
        if (serverRewards.length > 0) {
          returnString = '**Name   --    Level**\n';
          serverRewards.forEach((value) => {
            returnString += `\`${value.role_name} -- ${value.level_gained}\`\n`;
          });
        }
        embed.setTitle(`Rewards roles for ${message.guild.name}`.substring(0, 255))
          .setDescription(returnString.substring(0, 2048)).setColor(okay);
        message.channel.send({ embed }).catch(console.error);
      }).catch(console.error);
    }
    if (args[0] === 'add') {
      if (args.length < 3) {
        embed.setDescription('Not enough arguments').setColor(warning);
        message.channel.send({ embed });
        return;
      }
      const tempRole = message.guild.roles.cache.find((role) => role.name === args[1]);
      if (!tempRole) {
        embed.setDescription(`No Role Found for ${args[1]}`).setColor(alert);
        message.channel.send({ embed });
        return;
      }
      Rewards.create({
        role_id: tempRole.id,
        role_name: tempRole.name,
        server_id: message.guild.id,
        level_gained: args[2],
      }).then((newReward) => {
        const thisServer = Servers.findOrCreate({
          where: { server_id: message.guild.id },
          defaults: { remove_roles: false },
        }).catch(console.error);
        newReward.setServer(thisServer);

        embed.setTitle('New rewards role created')
          .setDescription(`**Role Name:** ${args[1]}\n**Role ID:** ${newReward.role_id}\n**Unlocked:** ${newReward.level_gained}`)
          .setColor(okay);
        message.channel.send({ embed });
      }).catch(console.error);
    } else if (args[0] === 'rem' || args[0] === 'remove') {
      if (args.length < 2) {
        embed.setDescription('Not enough arguments').setColor(alert);
        message.channel.send({ embed });
        return;
      }
      const tempRole = message.guild.roles.cache.find((role) => role.name === args[1]);

      if (!tempRole) {
        embed.setDescription(`No Role Found for ${args[1]}`).setColor(alert);
        message.channel.send({ embed });
        return;
      }
      Rewards.destroy({
        where: {
          role_id: tempRole.id,
        },
      }).then((success) => {
        if (success === 0) {
          embed.setDescription('Couldn\'t remove role').setColor(alert);
          message.channel.send({ embed });
          return;
        }
        Rewards.findAll({
          where: {
            server_id: message.guild.id,
          },
        }).then((allRewards) => {
          let returnString = `Current reward roles for ${message.guild.name}:\n**Name   --    Level**\n`;
          allRewards.forEach((value) => {
            returnString += `\`${value.role_name} -- ${value.level_gained}\`\n`;
          });
          embed.setTitle(`Successfully deleted the reward role ${args[1]}`)
            .setDescription(returnString).setColor(okay);
          message.channel.send({ embed });
        }).catch(console.error);
      }).catch(console.error);
    }
  },
};
