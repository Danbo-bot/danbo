module.exports = {
    name: 'ping',
    description: 'Ping!',
    execute(message, args, sequelize) {
        message.channel.send(new Date().getTime() - message.createdTimestamp + " ms");
    },
};