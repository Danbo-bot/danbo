const { Servers } = require('../dbObjects');

function StringReplace(inString, serverName, url) {
  if (inString.includes('%server_name%')) {
    console.log('1');
    inString.replace(/%server_name%/g, `${serverName}`);
  }
  if (inString.includes('%url%')) {
    console.log('2');
    inString.replace(/%url%/g, `${url}`);
  }
  return inString;
}

module.exports = {
  name: 'levels',
  description: 'Returns a url to the servers leaderboard',
  async execute(message) {
    const currentServer = await Servers.find({ where: { server_id: message.guild.id } });
    if (!currentServer) {
      message.channel.send('This server is not being tracked right now, if this is in error contact Dashwav');
      return;
    }
    const newString = StringReplace(currentServer.levels_string, currentServer.server_name, `https://www.danbo.space/leaderboards/${currentServer.server_id}`);
    message.channel.send(newString);
  },
};

