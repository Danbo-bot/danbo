const Sequelize = require('sequelize');

const sequelize = new Sequelize('marvindb', 'marvin', 'password', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
    operatorsAliases: false,
});

const Users = sequelize.import('models/Users');
const Servers = sequelize.import('models/Servers');
const Rewards = sequelize.import('models/Rewards');
const Warnings = sequelize.import('models/Warnings');

Rewards.belongsTo(Servers, {foreignKey: 'server_id', as: 'server'});

Servers.prototype.addItem = async function(role, triggerLevel) {
    Rewards.upsert({
        role_id: role.id,
        server_id: this.server_id,
        level_gained: triggerLevel
    });
}

module.exports = { Users, Warnings, Servers, Rewards };