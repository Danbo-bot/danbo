const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Map-object that logs who has gotten exp in the last minute
const lastMinute = new Discord.Collection();
function clearMap(){
    lastMinute.clear();
}
setInterval(clearMap, 60000)

// New Sequilize object
const Sequelize = require('sequelize');
const sequelize = new Sequelize('marvindb', 'marvin', 'password', {
  host: 'localhost',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});
const Users = sequelize.import('models/Users');
const Rewards = sequelize.import('models/Rewards');

async function addExperience(id, amount) {
    if (lastMinute.has(id)) return false; 
    const user = await Users.findByPrimary(id).catch(console.error);
    var levelUp = false;
    if (user) {
        user.experience += Number(amount);
        console.log(user.experience);
        const currentLevel = Math.floor(Math.sqrt(user.experience) / 9.5)
        if (currentLevel > user.level) {
            user.level = currentLevel;
            levelUp = true;
        };
        const updatedUser = await Users.upsert({
            user_id: user.user_id,
            experience: user.experience,
            level: user.level,
        }).catch(console.error);
        lastMinute.set(id, + new Date());
        return levelUp;
    }
    const newUser = await Users.create({ user_id: id, experience: amount });
    lastMinute.set(id, + new Date());
    return false;
}

async function getExperience(id) {
		const user = Users.findByPrimary(id);
		return user ? user.experience : 0;
}

const { prefix, token } = require('./config.json');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log('Ready!');
});

client.on('message', async message => {
    if (message.author.bot) return;
    const levelUp = await addExperience(message.author.id, Math.floor(Math.random() * (19 - 11)) + 11)
    if (levelUp) {
        message.channel.send('level up!')
    }
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);
    if (command.args && !args.length) {
        return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
    }
    try {
        command.execute(message, args, Users);
    }
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(token);