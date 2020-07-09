const fs = require('fs');
const Discord = require('discord.js');
const { alert } = require('./colors.json');
const { dev } = require('./config.json');

const client = new Discord.Client();

process.env.FONTCONFIG_PATH = './assets/fonts';

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

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
  // If the user isn't blacklisted then add amount of xp to them
  // this function also assigns their level based on their exp
  // returns true if successful (and not blacklisted), false otherwise

  if (!dev) {
    if (lastMinute.has(user.id)) return false;
  }
  const allBlacklisted = await Blacklisted.findAll({ where: { server_id: guild.id } });
  const memberRoles = member.roles.cache.values();
  const allRoles = allBlacklisted.map((role) => role.role_id);
  let hasRole = false;
  for (let i = 0; i < memberRoles.length && !hasRole; i += 1) {
    for (let k = 0; k < allRoles.length && !hasRole; k += 1) {
      if (memberRoles[i].id === allRoles[k]) { hasRole = true; }
    }
  }
  if (hasRole) { return false; }
  const dbUser = await Users.findOne({
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
  if (dbUser) {
    dbUser.experience += Number(amount);
    const currentLevel = Math.floor(Math.sqrt(dbUser.experience) / 8.6);
    if (currentLevel > dbUser.level) {
      dbUser.level = currentLevel;
    }
    await Users.upsert({
      id: dbUser.id,
      name: user.username,
      disc: user.discriminator,
      avatar_url: user.displayAvatarURL(),
      server_id: guild.id,
      experience: dbUser.experience,
      level: dbUser.level,
    }).catch(console.error);
    lastMinute.set(user.id, guild.id);
    return true;
  }
  console.log(user);
  await Users.create({
    id: user.id,
    name: user.username,
    disc: user.discriminator,
    avatar_url: user.displayAvatarURL(),
    server_id: guild.id,
    experience: amount,
  });
  lastMinute.set(user.id, guild.id);
  return true;
}

async function userOnLevel(member, guild) {
  const user = await Users.findOne({
    where:
    {
      id: member.id,
      server_id: guild.id,
    },
  });

  if (!user) { return; }

  const server = await Servers.findOne({
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

  // To determine current reward level (assuming both rewards and
  // bot role removal is enabled) make a list of all roles owned by
  // user. First remove all reward roles from that array. Simultaneously
  // determine if the users level >= a reward level.
  // Store the highest level achieveable by user given their level
  // into currentRole. Finally add currentRole into the list of roles
  // for the user and set them all at once IFF the new role is different
  // than their current role. Better for API
  if (allRewards) {
    const theMember = member;
    const roles = await theMember.roles.cache.values();
    let currentRole = null; // Stores the reward role to apply
    const storedRoles = []; // stores current reward role of user
    for (let j = 0; j < allRewards.length; j += 1) {
      const tempRole = guild.roles.findOne('id', allRewards[j].role_id);
      const index = roles.indexOf(tempRole);
      if (index > -1) {
        storedRoles.push(allRewards[j]);
        if (server.remove_roles) { roles.splice(index, 1); }
      }
      if (allRewards[j].level_gained <= user.level) {
        if (!currentRole) {
          currentRole = allRewards[j];
        } else if (allRewards[j].level_gained > currentRole.level_gained) {
          currentRole = allRewards[j];
        }
      }
    }
    // If stored roles does not include Current role or if stored roles is greater than 1
    if (!(storedRoles.includes(currentRole) && storedRoles.length === 1)) {
      if (currentRole && roles) {
        roles.push(guild.roles.findOne('id', currentRole.role_id));
        await theMember.setRoles(roles);
      }
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
  const success = await addExperience(message.author, message.member, message.guild, mathifyExp());
  if (success) {
    userOnLevel(message.member, message.guild);
  }
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);
  const embed = new Discord.MessageEmbed().setTimestamp();

  if (command.args && !args.length) {
    let reply = 'You didn\'t provide any arguments!';
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    embed.setTitle('Error').setDescription(reply).setColor(alert);
    message.reply({ embed });
    return;
  }
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    embed.setTitle('Error').setDescription('There was an error trying to execute that command!').setColor(alert);
    message.reply({ embed });
  }
});

client.on('guildMemberAdd', async (member) => {
  userOnLevel(member, member.guild);
});

client.login(token);
