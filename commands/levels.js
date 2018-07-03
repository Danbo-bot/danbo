const { Servers } = require('../dbObjects');

function StringReplace(inString, serverName, url) {
  let retString = inString;
  if (inString.includes('%server_name%')) {
    retString = retString.replace(/%server_name%/g, `${serverName}`);
  }
  if (inString.includes('%url%')) {
    retString = retString.replace(/%url%/g, `${url}`);
  }
  return retString;
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

