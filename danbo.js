const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();

process.env.FONTCONFIG_PATH = './assets/fonts';

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Map-object that logs who has gotten exp in the last minute
const lastMinute = new Discord.Collection();
function clearMap() {
  lastMinute.clear();
}
setInterval(clearMap, 60000);

const {
  Users, Rewards, Blacklisted, Servers,
} = require('./dbObjects');

async function addExperience(user, member, guild, amount) {
  // if (lastMinute.has(user.id)) return false;
  const allBlacklisted = await Blacklisted.findAll({ where: { server_id: guild.id } });
  const memberRoles = member.roles.array();
  const allRoles = allBlacklisted.map(role => role.role_id);
  let hasRole = false;
  for (let i = 0; i < memberRoles.length && !hasRole; i += 1) {
    for (let k = 0; k < allRoles.length && !hasRole; k += 1) {
      if (memberRoles[i].id === allRoles[k]) { hasRole = true; }
    }
  }
  if (hasRole) { return false; }
  const dbUser = await Users.find({
    where:
    {
      id: user.id,
      server_id: guild.id,
    },
  }).catch(console.error);
  const server = await Servers.findOrCreate({
    where: { server_id: guild.id, server_name: guild.name },
  });
  if (!server) { return false; }
  let levelUp = false;
  if (dbUser) {
    dbUser.experience += Number(amount);
    const currentLevel = Math.floor(Math.sqrt(dbUser.experience) / 8.6);
    if (currentLevel > dbUser.level) {
      dbUser.level = currentLevel;
      levelUp = true;
    }
    await Users.upsert({
      id: dbUser.id,
      name: user.username,
      disc: user.discriminator,
      avatar_url: user.avatarURL,
      server_id: guild.id,
      experience: dbUser.experience,
      level: dbUser.level,
    }).catch(console.error);
    lastMinute.set(user.id, guild.id);
    return levelUp;
  }
  await Users.create({
    id: user.id,
    name: user.username,
    disc: user.discriminator,
    avatar_url: user.avatarURL,
    server_id: guild.id,
    experience: amount,
  });
  lastMinute.set(user.id, guild.id);
  return false;
}

async function userOnLevel(member, guild) {
  const user = await Users.find({
    where:
    {
      id: member.id,
      server_id: guild.id,
    },
  });

  if (!user) { return; }

  const server = await Servers.find({
    where:
    {
      server_id: guild.id,
    },
  });

  const allRewards = await Rewards.findAll({
    where: {
      server_id: guild.id,
    },
  });
  if (allRewards) {
    const theMember = member;
    if (server.remove_roles) {
      const removeList = [];
      let currentRole = null;
      for (let j = 0; j < allRewards.length; j += 1) {
        const tempRole = guild.roles.find('id', allRewards[j].role_id);

        if (allRewards[j].level_gained <= user.level) {
          if (!currentRole) { currentRole = allRewards[j]; }
          if (allRewards[j].level_gained > currentRole.level_gained) {
            if (theMember.roles.has(currentRole.id)) {
              removeList.push(guild.roles.find('id', currentRole.role_id));
            }
            currentRole = allRewards[j];
          } else if (theMember.roles.has(tempRole.id) && currentRole !== tempRole) {
            removeList.push(tempRole);
          }
        } else if (theMember.roles.has(tempRole.id)) {
          removeList.push(tempRole);
        }
      }
      if (currentRole) {
        currentRole = guild.roles.find('id', currentRole.role_id)
        await theMember.addRole(currentRole);
      }
      if (removeList === undefined || removeList.length === 0) { return; }
      await theMember.removeRoles(removeList);
    }
  }
}

const { prefix, token } = require('./config.json');

commandFiles.forEach((file) => {
  const string = `./commands/${file}`;
  const command = require(string);
  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
});

client.on('ready', () => {
  console.log('Ready!');
});

function mathifyExp() { return Math.floor(Math.random() * (27 - 14)) + 14; }

client.on('message', async (message) => {
  if (message.author.bot) return;
  const levelUp = await addExperience(message.author, message.member, message.guild, mathifyExp());
  if (levelUp) {
    userOnLevel(message.member, message.guild);
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

client.on('guildMemberAdd', async (member) => {
  userOnLevel(member, member.guild);
});
client.login(token);
