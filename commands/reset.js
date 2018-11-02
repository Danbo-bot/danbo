const { Users, Servers } = require('../dbObjects');
const { alert, warning, okay } = require('../colors.json');
const Discord = require('discord.js');

async function ResetLeaderboards(server_id) {
    return Users.destroy({
        where: {
            server_id: server_id,
        }
    });
}

module.exports = {
  name: 'reset',
  description: 'Resets the leaderboard for current server',
  async execute(message) {
    if (!message.member.permissions.has('MANAGE_GUILD')) { return; }
    const currentServer = await Servers.find({ where: { server_id: message.guild.id } });
    const embed = new Discord.RichEmbed().setTimestamp();
    const successEmbed = new Discord.RichEmbed().setTimestamp();
    const errorEmbed = new Discord.RichEmbed().setTimestamp();

    const filter = m => m.content.toLowerCase() === 'confirm' && m.author.id === message.author.id;

    if (!currentServer) {
      embed.setColor(warning)
        .setDescription('This server is not being tracked right now, if this is in error contact Dashwav')
        .setTitle('Unsuccessful');
      message.channel.send({ embed });
      return;
    }
    embed.setColor(warning)
      .setDescription('You are about to completely reset **ALL** user levels for this server.\n' +
                      '**This is a completely irreversable action!** \n\n If you are sure you want to do this type `confirm` now.')
      .setTitle('Confirmation');
    message.channel.send({ embed }).then(msg => {
        msg.delete(5000);
    });
    message.channel.awaitMessages(filter, {max: 1, maxMatches: 1, time: 5000, errors: ['time']})
        .then(async collected=> {
            if (collected.size > 0) {
                ResetLeaderboards(message.guild.id).then(deleted => {
                    console.log(deleted);
                    
                    successEmbed.setColor(okay)
                        .setDescription(`**${deleted}** users have been reset!`)
                        .setTitle('Success');
                    message.channel.send({ embed: successEmbed });
                }).catch(err => {
                    console.log(err);
                    errorEmbed.setColor(alert)
                        .setDescription('There was an internal error, contact Dashwav')
                        .setTitle('Error');
                    message.channel.send({ embed: errorEmbed });
                });
            }
        }).catch(err => {});
  },
};

