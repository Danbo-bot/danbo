const Sequelize = require('sequelize');

const sequelize = new Sequelize('marvindb', 'marvin', 'password', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
    operatorsAliases: false,
});

sequelize.import('models/Users');
sequelize.import('models/Warnings');

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {

    console.log('Database synced');
    sequelize.close();

}).catch(console.error);