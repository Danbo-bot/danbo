module.exports = {
  name: 'ping',
  description: 'Ping!',
  execute(message) {
    message.channel.send(`${new Date().getTime() - message.createdTimestamp} ms`);
  },
};
