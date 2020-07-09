const Discord = require('discord.js');
const { Users, Servers } = require('../dbObjects');
const { alert, warning, okay } = require('../colors.json');

async function ResetLeaderboards(serverId) {
  return Users.destroy({
    where: { server_id: serverId },
  });
}

module.exports = {
  name: 'reset',
  description: 'Resets the leaderboard for current server',
  usage: '[blank]',

  async execute(message) {
    // Check User Permissions
    if (!message.member.permissions.has('MANAGE_GUILD')) { return; }

    const currentServer = await Servers.findOne({ where: { server_id: message.guild.id } });
    const embed = new Discord.MessageEmbed().setTimestamp();
    const successEmbed = new Discord.MessageEmbed().setTimestamp();
    const errorEmbed = new Discord.MessageEmbed().setTimestamp();

    // Verify Server is actually tracked
    if (!currentServer) {
      embed.setColor(warning)
        .setDescription('This server is not being tracked right now, if this is in error contact Dashwav')
        .setTitle('Unsuccessful');
      message.channel.send({ embed });
      return;
    }

    // Double Check they meant to type command
    embed.setColor(warning)
      .setDescription('You are about to completely reset **ALL** user levels for this server.\n' +
        '**This is a completely irreversable action!**\n\n If you are sure you want to do this type `confirm` now.')
      .setTitle('Confirmation');
    message.channel.send({ embed }).then((msg) => {
      msg.delete(5000);
    });

    const filter = (m) => m.content.toLowerCase() === 'confirm' && m.author.id === message.author.id;
    message.channel.awaitMessages(filter, {
      max: 1,
      maxMatches: 1,
      time: 5000,
      errors: ['time'],
    }).then(async (collected) => {
      // If confirmation Dialog succeeded
      if (collected.size > 0) {
        ResetLeaderboards(message.guild.id).then((deleted) => {
          console.log(deleted);

          successEmbed.setColor(okay)
            .setDescription(`**${deleted}** users have been reset!`)
            .setTitle('Success');
          message.channel.send({ embed: successEmbed });
        }).catch((err) => {
          console.log(err);
          errorEmbed.setColor(alert)
            .setDescription('There was an internal error, contact Dashwav')
            .setTitle('Error');
          message.channel.send({ embed: errorEmbed });
        });
      }
    }).catch(() => {});
  },
};
