// FTG Bot
// v1.1.0
// by Slash

// Config //
const TOKEN = ""; // The Discord user account - must own the groupchat!
const blocklist = []; // User IDs which cannot be removed from the groupchat
const yourKing = ""; // This should be your user ID - allows access to owner commands




const { Client, RichPresence } = require('discord.js-selfbot-v13');
const client = new Client();

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
  const status = new RichPresence(client)
    // .setApplicationId('1312887504407625843')
    .setType('STREAMING')
    .setURL('https://www.twitch.tv/milkeatery') // If you set a URL, it will automatically change to STREAMING type
    .setName('FTGBot - FTG2085')
    .setStartTimestamp(Date.now())
    .setPlatform('desktop')
  client.user.setPresence({ activities: [status] });
});

client.on("messageCreate", message => {


  if (message.content.startsWith('!yesking')) {

    const args = message.content.split(' ');

    if (message.author.id != yourKing) {
      if (blocklist.includes(Number(user))) {
        return message.reply('❌ No permission');
      }
    }
    if (args.length < 2) {
      return message.reply('❌ Please specify a user ID.');
    }

    const user = args[1];

    fetch(`https://discord.com/api/v9/channels/${message.channel.id}`, {
      "headers": {
        "authorization": TOKEN,
        "content-type": "application/json"
      },
      "body": "{\"owner\":\"" + user + "\"}",
      "method": "PATCH"
    }).then(response => {
      if (response.ok) {
        message.reply(`✅ <@${user}> \`${user}\` is the now the king!`);
      } else {
        response.text().then(error => {
          message.reply(`❌ Failed to make <@${user}> \`${user}\` the king: ${error}`);
        });
      }
    })
      .catch(error => {
        message.reply(`❌ Error: ${error}`);
      });

  }

  if (message.content.startsWith('!removeuser')) {
    const args = message.content.split(' ');
    if (args.length < 2) {
      return message.reply('❌ Please specify a user ID.');
    }

    const user = args[1];

    if (message.author.id != yourKing) {
      if (blocklist.includes(Number(user))) {
        return message.reply('❌ You cannot remove that user. ');
      }

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
          message.reply(`✅ Removed <@${user}> \`${user}\` from the groupchat`);
        } else {
          response.text().then(error => {
            message.reply(`❌ Could not remove <@${user}> \`${user}\` from the groupchat: ${error}`);
          });
        }
      })
      .catch(error => {
        message.reply(`❌ Error: ${error}`);
      });
  }
  //if (message.content.includes('millx' || '720022112466894970')) {
  //  message.react('👎');
  //}
  // !millxisannoying command
  if (message.content.startsWith('!millxisannoying') || message.content.startsWith('!kysmillx') || message.content.startsWith('!stfumillx') || message.content.startsWith('!stfu millx') || message.content.startsWith('!millx stfu')) {
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
