// FTG Bot
// v1.0.0
// by Slash
const TOKEN = ""; // Discord USER token
const blocklist = []; // User IDs which cannot be removed from GC
const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on("messageCreate", message => {
  // !removeuser command
  if (message.content.startsWith('!removeuser')) {
    const args = message.content.split(' ');
    if (args.length < 2) {
      return message.reply('Error: Please specify a user ID.');
    }

    const user = args[1];

    if (blocklist.includes(Number(user))) {
      return message.reply('Nice try buddy! ');
    }
    
    console.log(user);
    console.log(message.channelId);

    fetch(`https://discord.com/api/v9/channels/${message.channelId}/recipients/${user}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `${TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          message.reply(`✅ Removed <@${user}> \`${user}\``);
        } else {
          response.text().then(error => {
            message.reply(`❌ Error: ${error}`);
          });
        }
      })
      .catch(error => {
        message.reply(`❌ Error: ${error}`);
      });
  }

  // !millxisannoying command
  if (message.content.startsWith('!millxisannoying') || message.content.startsWith('!kysmillx') || message.content.startsWith('!stfumillx') || message.content.startsWith('stfu millx') || message.content.startsWith('millx stfu')) {
    const args = message.content.split(' ');

    const user = args[1];
    console.log(user);
    console.log(message.channelId);

    fetch(`https://discord.com/api/v9/channels/${message.channelId}/recipients/720022112466894970`, {
      method: 'DELETE',
      headers: {
        'Authorization': `${TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          message.reply("✅ Removed Millx");
        } else {
          response.text().then(error => {
            message.reply(`❌ Error: ${error}`);
          });
        }
      })
      .catch(error => {
        message.reply(`❌ Error: ${error}`);
      });
  }
});

client.login(TOKEN);
