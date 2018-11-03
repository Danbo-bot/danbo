const Sequelize = require('sequelize');

const { dbCreds } = require('../config.json');

const sequelize = new Sequelize(dbCreds.dbName, dbCreds.dbUser, dbCreds.dbPass, {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  operatorsAliases: false,
});

const Users = sequelize.import('models/Users');
const Servers = sequelize.import('models/Servers');
const Rewards = sequelize.import('models/Rewards');
const Blacklisted = sequelize.import('models/Blacklist');

Rewards.belongsTo(Servers, { foreignKey: 'server_id', as: 'server' });
Blacklisted.belongsTo(Servers, { foreignKey: 'server_id', as: 'server' });

Servers.prototype.addItem = async function (role, triggerLevel) {
  Rewards.upsert({
    role_id: role.id,
    server_id: this.server_id,
    level_gained: triggerLevel,
  });
};

module.exports = {
  Users, Servers, Rewards, Blacklisted, sequelize,
};
