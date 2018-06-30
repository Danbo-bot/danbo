const { sequelize } = require('../dbObjects');
const Discord = require('discord.js');
const Canvas = require('canvas');
const { registerFont } = require('canvas');
const snekfetch = require('snekfetch');

function roundedImage(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo((x + width) - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, (y + height) - radius);
  ctx.quadraticCurveTo(x + width, y + height, (x + width) - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, (y + height) - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function expToNextLevel(exp, lvl) {
  return Math.ceil(((lvl + 1) * 8.6) ** 2) - Math.ceil(((lvl) * 8.6) ** 2);
}

function expSinceLastLevel(exp, lvl) {
  return exp - Math.ceil((lvl * 8.6) ** 2);
}

const applyText = (canvas, text) => {
  const ctx = canvas.getContext('2d');

  // Declare a base size of the font
  let fontSize = 44;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `${fontSize -= 4}px Roboto`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (ctx.measureText(text).width > 310);

  // Return the result to use in the actual canvas
  return ctx.font;
};

module.exports = {
  name: 'rank',
  description: 'Grabs rank for user',
  async execute(message) {
    const [author] = await sequelize.query(
      'SELECT id, experience, level, rank() OVER(ORDER BY experience) FROM users WHERE id = ?',
      { raw: true, replacements: [message.author.id], type: sequelize.QueryTypes.SELECT },
    );
    registerFont('../assets/fonts/Roboto-Thin.ttf', { family: 'Roboto' });
    const expSinceLevel = expSinceLastLevel(author.experience, author.level);
    const toNextLevel = expToNextLevel(author.experience, author.level);
    const canvas = Canvas.createCanvas(900, 250);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.save();
    roundedImage(ctx, 0, 0, canvas.width, canvas.height, 20);
    ctx.clip();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.fillStyle = 'rgba(169, 169, 169, .2)';
    ctx.save();
    ctx.fillRect(220, 74, 660, 140);
    ctx.restore();

    ctx.font = applyText(canvas, message.member.displayName);
    ctx.fillStyle = '#FFF';
    ctx.textBaseline = 'bottom';
    ctx.fillText(message.member.displayName, 250, canvas.height - 124);
    const nameText = ctx.measureText(message.member.displayName).width;

    ctx.font = '28px Roboto';
    ctx.fillStyle = '#CECECE';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`#${message.author.discriminator}`, 250 + nameText + 2, canvas.height - 124);

    ctx.font = '38px Roboto';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Level ${author.level}`, canvas.width - 45, canvas.height - 124);

    ctx.font = '28px Roboto';
    ctx.fillStyle = '#CECECE';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Total EXP: ${author.experience}`, canvas.width - 45, canvas.height - 40);

    ctx.font = '40px Roboto';
    ctx.fillStyle = '#337ab7';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`#${author.rank}`, canvas.width - 35, 10);
    const rankText = ctx.measureText(`#${author.rank}`).width;

    ctx.font = '40px Roboto';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('Rank:', canvas.width - 35 - rankText, 10);

    // Set faux rounded corners
    ctx.save();
    roundedImage(ctx, 30, 30, 190, 190, 10);
    ctx.clip();

    // Add avatar to image
    const { body: buffer } = await snekfetch.get(message.author.displayAvatarURL);
    const avatar = await Canvas.loadImage(buffer);
    ctx.drawImage(avatar, 30, 30, 190, 190);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#f2f3f4';
    roundedImage(ctx, 240, canvas.height - 114, 620, 36, 12);
    ctx.clip();
    ctx.fillRect(240, canvas.height - 114, 620, 36);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#337ab7';
    const percentage = 620 * (expSinceLevel / toNextLevel);
    roundedImage(ctx, 240, canvas.height - 114, percentage, 36, 12);
    ctx.clip();
    ctx.fillRect(240, canvas.height - 114, percentage, 36);
    ctx.restore();

    ctx.font = '28px Roboto';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${expSinceLevel}/${toNextLevel}`, 550, canvas.height - 58 - 28 - 10);

    const attachment = new Discord.Attachment(canvas.toBuffer(), 'rank-card.png');
    if (author) {
      message.channel.send('', attachment);
      return;
    }
    message.args.send('fuck');
  },
};
