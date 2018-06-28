const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Map-object that logs who has gotten exp in the last minute
const lastMinute = new Discord.Collection();
function clearMap() {
  lastMinute.clear();
}
setInterval(clearMap, 60000);

const { Users, Rewards } = require('./dbObjects');

async function addExperience(user, amount) {
  // if (lastMinute.has(user.id)) return false;
  const dbUser = await Users.findByPrimary(user.id).catch(console.error);
  let levelUp = false;
  if (dbUser) {
    dbUser.experience += Number(amount);
    console.log(`${dbUser.experience} - ${dbUser.level}`);
    const currentLevel = Math.floor(Math.sqrt(dbUser.experience) / 9.5);
    if (currentLevel > dbUser.level) {
      dbUser.level = currentLevel;
      levelUp = true;
    }
    await Users.upsert({
      user_id: dbUser.user_id,
      experience: dbUser.experience,
      level: dbUser.level,
    }).catch(console.error);
    lastMinute.set(user.id, +new Date());
    return levelUp;
  }
  await Users.create({
    user_id: user.id,
    user_avatar: user.avatarURL,
    experience: amount,
  });
  lastMinute.set(user.id, +new Date());
  return false;
}

async function userOnLevel(message) {
  const user = await Users.findById(message.author.id);
  const allRewards = await Rewards.findAll({
    where: {
      server_id: message.guild.id,
    },
  });
  if (allRewards) {
    const theMember = message.member;
    const removeList = [];
    let rewardThisRole = null;
    allRewards.forEach((role) => {
      const tempRole = message.guild.roles.find('id', role.role_id);
      if (theMember.roles.has(tempRole.id)) {
        removeList.push(tempRole);
      }
      if (role.level_gained === user.level) { rewardThisRole = tempRole; }
    });
    if (rewardThisRole) {
      theMember.addRole(rewardThisRole).then(() => {
        if (removeList === undefined || removeList.length === 0) { return; }
        theMember.removeRoles(removeList);
      });
    }
  }
}

const { prefix, token } = require('./config.json');

commandFiles.forEach((file) => {
  const string = `./commands/${file}`;
  const command = require(string);sss.
  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
});

client.on('ready', () => {
  console.log('Ready!');
});

function mathifyExp() { return Math.floor(Math.random() * (19 - 11)) + 11; }

client.on('message', async (message) => {
  if (message.author.bot) return;
  const levelUp = await addExperience(message.author, mathifyExp());
  if (levelUp) {
    userOnLevel(message);
  }
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    message.channel.send(reply);
    return;
  }
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(token);
