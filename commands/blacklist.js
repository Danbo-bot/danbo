const { Blacklisted, Servers } = require('../dbObjects');

module.exports = {
  name: 'blacklist',
  description: 'Returns the reward ranks for a server, allows one to add more',
  usage: '<add/remove> <rolename: str> <levelGained: int>',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_GUILD')) { return; }
    if (args.length === 0) {
      Blacklisted.findAll({
        where:
        { server_id: message.guild.id },
      }).then((serverBlacklisted) => {
        let returnString = `Blacklisted for ${message.guild.name}:\n`;
        serverBlacklisted.forEach((value) => {
          returnString += `${value.role_name} - ${value.level_gained}\n`;
        });
        message.channel.send(returnString);
      });
    }
    if (args[0] === 'add') {
      if (args.length < 2) {
        message.channel.send('Not enough arguments');
        return;
      }
      const tempRole = message.guild.roles.find('name', args[1]);
      if (!tempRole) { return; }
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
        message.channel.send(`New role created:\nRole ID:${newReward.role_id}\nUnlocked:${newReward.level_gained}`);
      });
    } else if (args[0] === 'rem' || args[0] === 'remove') {
      if (args.length < 2) {
        message.channel.send('Not enough arguments');
        return;
      }
      const tempRole = message.guild.roles.find('name', args[1]);
      if (!tempRole) { return; }
      Blacklisted.destroy({
        where: {
          role_id: tempRole.id,
        },
      }).then((success) => {
        if (success === 0) { return; }
        Blacklisted.findAll({
          where: {
            server_id: message.guild.id,
          },
        }).then((allBlacklisted) => {
          let returnString = `Successfully deleted the role reward\n Current blacklist for ${message.guild.name}:\n`;
          allBlacklisted.forEach((value) => {
            returnString += `${value.role_name} - ${value.level_gained}\n`;
          });
          message.channel.send(returnString);
        });
      });
    }
  },
};
