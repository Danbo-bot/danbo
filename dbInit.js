const Sequelize = require('sequelize');

const { dbCreds } = require('./config.json');

const sequelize = new Sequelize(dbCreds.dbName, dbCreds.dbUser, dbCreds.dbPass, {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  operatorsAliases: false,
});

sequelize.import('models/Users');
sequelize.import('models/Rewards');
sequelize.import('models/Servers');

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
  console.log('Database synced');
  sequelize.close();
}).catch(console.error);
