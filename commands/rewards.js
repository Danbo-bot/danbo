const { Rewards, Servers } = require('../dbObjects');

module.exports = {
  name: 'rewards',
  description: 'Returns the reward ranks for a server, allows one to add more',
  usage: '<add/remove> <rolename: str> <levelGained: int>',
  async execute(message, args) {
    if (args.length === 0) {
      Rewards.findAll({
        where:
        { server_id: message.guild.id },
      }).then((serverRewards) => {
        let returnString = `Rewards for ${message.guild.name}:\n`;
        serverRewards.forEach((value) => {
          returnString += `${value.role_name} - ${value.level_gained}\n`;
        });
        message.channel.send(returnString);
      });
    }
    if (args[0] === 'add') {
      if (args.length < 3) {
        message.channel.send('Not enough arguments');
        return;
      }
      const tempRole = message.guild.roles.find('name', args[1]);
      if (!tempRole) { return; }
      Rewards.create({
        role_id: tempRole.id,
        role_name: tempRole.name,
        server_id: message.guild.id,
        level_gained: args[2],
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
      Rewards.destroy({
        where: {
          role_id: tempRole.id,
        },
      }).then((success) => {
        if (success === 0) { return; }
        Rewards.findAll({
          where: {
            server_id: message.guild.id,
          },
        }).then((allRewards) => {
          let returnString = `Successfully deleted the role reward\n Current rewards for ${message.guild.name}:\n`;
          allRewards.forEach((value) => {
            returnString += `${value.role_name} - ${value.level_gained}\n`;
          });
          message.channel.send(returnString);
        });
      });
    }
  },
};
