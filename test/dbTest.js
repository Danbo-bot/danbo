const Sequelize = require('sequelize');
const { expect } = require('chai');
const Discord = require('discord.js');

const client = new Discord.Client();

// eslint-disable-next-line no-console
const log = (...args) => console.log(process.uptime().toFixed(3), ...args);

const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  '', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  },
);

sequelize.import('../models/Users');
sequelize.import('../models/Rewards');
sequelize.import('../models/Servers');
sequelize.import('../models/Blacklist');

const force = process.argv.includes('--force') || process.argv.includes('-f');


expect(() => sequelize.sync({ force }).then(async () => {
  sequelize.close();
})).to.not.throw();

client.on('debug', log);
client.on('ready', () => {
  log('READY', client.user.tag, client.user.id);
  client.destroy();
});

expect(() => client.login(process.env.TOKEN)).to.not.throw();
