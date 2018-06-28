const { Users } = require('../dbObjects');

module.exports = {
  name: 'rank',
  description: 'Grabs rank for user',
  async execute(message) {
    const author = await Users.findByPrimary(message.author.id);
    if (author) {
      message.channel.send(`Your rank is: ${author.level}`);
      return;
    }
    message.args.send('fuck');
  },
};
