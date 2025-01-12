/**
 * FTGBot - FTG2085
 * 
 * A selfbot to perform various administrative actions in a Discord group or channel.
 * This code is intended for educational and demonstration purposes only. 
 * USE AT YOUR OWN RISK. Selfbot behavior may violate Discord's Terms of Service.
 *
 * @fileoverview Main entry point for FTGBot (FTG2085) - A Discord selfbot by FTG2085
 * @version 2.0
 */

const { Client, RichPresence } = require('discord.js-selfbot-v13');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Define the restricted users folder
const RESTRICTED_USERS_FOLDER = path.join(__dirname, 'restricted_users');

// Ensure the folder exists
if (!fs.existsSync(RESTRICTED_USERS_FOLDER)) {
  fs.mkdirSync(RESTRICTED_USERS_FOLDER);
}

// Load configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const TOKEN = config.TOKEN;
const BOT_USER_ID = config.BOT_USER_ID;
const OWNER_ID = config.OWNER_ID;
const DEBUG_MODE = config.DEBUG_MODE;
const blocklist = config.blocklist;

console.clear();
console.log(chalk.blue.bold(`⁎`), chalk.blue('FTGBot - A Discord selfbot for managing group chats by FTG2085'));

/**
 * Initialize selfbot client.
 * @type {Client}
 */
const client = new Client();

/**
 * Called when the selfbot is ready.
 * Sets a custom presence on Discord and logs a status message.
 */
client.on('ready', async () => {
  console.log(chalk.blue(`[INFO]`), `Logged in as ${client.user.username}`);

  // Set up custom Rich Presence
  const status = new RichPresence(client)
    .setType('STREAMING')
    .setURL('https://www.twitch.tv/milkeatery')
    .setName('FTGBot - FTG2085')
    .setStartTimestamp(Date.now())
    .setPlatform('desktop');

  try {
    await client.user.setPresence({ activities: [status] });
    console.log(chalk.blue(`[INFO]`), 'Presence set successfully.');
  } catch (presenceError) {
    console.error(chalk.red(`[ERROR]`), 'Failed to set presence:', presenceError);
  }
});

/**
 * Fetch the list of user relationships (friends, blocked, etc.).
 * @returns {Promise<string[]>} Array of user IDs as strings.
 * @throws Will throw if the fetch request fails or receives a non-OK response.
 */
async function fetchUserRelationships() {
  const response = await fetch("https://discord.com/api/v9/users/@me/relationships", {
    headers: {
      accept: "*/*",
      authorization: TOKEN
    },
    method: "GET"
  });

  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`Error fetching user relationships: ${error}`);
  }
  const data = await response.json();
  return data.map(user => user.id);
}

/**
 * Safely reply to a message if the channel exists. Handles errors gracefully.
 * @param {import('discord.js').Message} message - The incoming Discord message object.
 * @param {string} replyText - The text to send as a reply.
 */
async function safeReply(message, replyText) {
  try {
    if (message.channel) {
      await message.reply(replyText);
      if (DEBUG_MODE) console.log(chalk.gray(`[DEBUG]`), `Replied to message: ${replyText}`);
    } else {
      throw new Error('CHANNEL_NOT_CACHED');
    }
  } catch (error) {
    console.error(chalk.red(`[ERROR]`), `${error.message}. Could not find the channel in the cache!`);
  }
}

/**
 * Send a PATCH request to change a group owner.
 * @param {string} channelId - The Discord channel ID.
 * @param {string|number} newOwner - The user ID of the new owner.
 * @returns {Promise<Response>} The fetch response object.
 */
async function makeUserKing(channelId, newOwner) {
  try {
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}`, {
      headers: {
        'authorization': TOKEN,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ owner: newOwner }),
      method: 'PATCH'
    });
    if (DEBUG_MODE) console.log(chalk.gray(`[DEBUG]`), `Attempting to make user owner: ${newOwner}`);
    return response;
  } catch (err) {
    console.error(chalk.red(`[ERROR]`), 'Failed to make user owner:', err);
    return { ok: false, statusText: err.message };
  }
}

/**
 * Removes a user from a group with a DELETE request.
 * @param {string} channelId - The Discord channel ID.
 * @param {string|number} userId - The user ID to be removed.
 * @returns {Promise<Response>} The fetch response object.
 */
async function removeUserFromGroup(channelId, userId) {
  try {
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/recipients/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json'
      }
    });
    if (DEBUG_MODE) console.log(chalk.gray(`[DEBUG]`), `DELETE request to remove user: ${userId}`);
    return response;
  } catch (err) {
    console.error(chalk.red(`[ERROR]`), 'Failed to remove user from group:', err);
    return { ok: false, statusText: err.message };
  }
}

/**
 * Fetch data about a specified channel.
 * @param {string} channelId - The Discord channel ID.
 * @returns {Promise<Object|null>} The channel data as JSON or null on error.
 */
async function getChannelData(channelId) {
  try {
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}`, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json'
      }
    });
    if (DEBUG_MODE) console.log(chalk.gray(`[DEBUG]`), `Fetching channel data for: ${channelId}`);
    return await response.json();
  } catch (err) {
    console.error(chalk.red(`[ERROR]`), 'Failed to fetch channel data:', err);
    return null;
  }
}

/**
 * Creates a new group chat with the listed IDs in 'blocklist'.
 * @returns {Promise<Object|null>} The new channel data or null on error.
 */
async function createNewGroupChat() {
  try {
    const response = await fetch("https://discord.com/api/v9/users/@me/channels", {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipients: blocklist.map(String) }),
      method: 'POST'
    });
    if (DEBUG_MODE) console.log(chalk.gray(`[DEBUG]`), `Creating new group chat with: ${blocklist}`);
    return await response.json();
  } catch (err) {
    console.error(chalk.red(`[ERROR]`), 'Failed to create a new group chat:', err);
    return null;
  }
}

/**
 * Main message handler: listens for commands starting with '!' and responds accordingly.
 */
client.on("messageCreate", async message => {
  try {
    // Ignore messages that don't start with '!'
    if (!message.content.startsWith('!')) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (DEBUG_MODE) console.log(chalk.gray(`[DEBUG]`), `Command: ${command}, Args: ${args}`);

    if (command === '!restrictuser') {
      if (message.author.id !== OWNER_ID) {
        await safeReply(message, '❌ You do not have permission to use this command.');
        return;
      }

      if (args.length < 1) {
        await safeReply(message, '❌ Please provide a user ID to restrict.');
        return;
      }

      const userId = args[0];
      const reason = args.slice(1).join(' ') || 'No reason provided';
      const userFilePath = path.join(RESTRICTED_USERS_FOLDER, `${userId}.json`);

      if (fs.existsSync(userFilePath)) {
        fs.unlinkSync(userFilePath);
        await safeReply(message, `✅ User <@${userId}> has been unrestricted.`);
      } else {
        fs.writeFileSync(userFilePath, JSON.stringify({ reason }));
        await safeReply(message, `✅ User <@${userId}> has been restricted. Reason: ${reason}`);
      }
      return;
    }

    // Check if the user is restricted
    const userFilePath = path.join(RESTRICTED_USERS_FOLDER, `${message.author.id}.json`);
    if (fs.existsSync(userFilePath)) {
      const { reason } = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
      await safeReply(message, `❌ You have been restricted from using FTGBot. Reason: ${reason}`);
      return;
    }
    // !yesking
    if (command === '!yesking') {
      if (args.length < 1) {
        await safeReply(message, '❌ Please specify a user ID.');
        return;
      }
      const user = args[0];
      if (blocklist.includes(Number(user))) {
        await safeReply(message, '❌ No permission to crown this user.');
        return;
      }
      const response = await makeUserKing(message.channel.id, user);
      if (response.ok) {
        await safeReply(message, `✅ <@${user}> \`${user}\` is now the king!`);
      } else {
        const error = await response.text().catch(() => response.statusText);
        await safeReply(message, `❌ Failed to make <@${user}> \`${user}\` the king: ${error}`);
      }
    }

    // !removeuser
    if (command === '!removeuser') {
      if (args.length < 1) {
        await safeReply(message, '❌ Please specify a user ID.');
        return;
      }
      const user = args[0].replace(/[<@>]/g, '');
      if (message.author.id !== OWNER_ID && blocklist.includes(Number(user))) {
        await safeReply(message, '❌ You cannot remove that user.');
        return;
      }
      const response = await removeUserFromGroup(message.channel.id, user);
      if (response.ok) {
        await safeReply(message, `✅ Removed <@${user}> \`${user}\` from the group chat.`);
      } else {
        const error = await response.text().catch(() => response.statusText);
        await safeReply(message, `❌ Could not remove <@${user}> \`${user}\` from the group chat: ${error}`);
      }
    }

    // !voteremove
    if (command === '!voteremove') {
      const userId = args[0]?.replace(/[<@>]/g, '');
      const timer = parseInt(args[1], 10);
      if (!userId || isNaN(timer)) {
      return safeReply(message, '❌ Please provide a user ID and a timer in seconds.');
      }

      let voteMessage;
      if (userId === '-1') {
      voteMessage = await message.channel.send(`@everyone\n## **VOTE** to self-destruct the group chat has started!\nReact with 👍 or 👎.\n⌚ **${timer} seconds**!`);
      } else {
      const user = message.channel.recipients?.get(userId);
      if (!user) {
        return safeReply(message, '❌ User not found.');
      }
      if (message.author.id !== OWNER_ID && blocklist.includes(Number(userId))) {
        await safeReply(message, '❌ You cannot remove that user.');
        return;
      }
      voteMessage = await message.channel.send(`@everyone\n## **VOTE** to remove <@${user.id}> has started!\nReact with 👍 or 👎.\n⌚ **${timer} seconds**!`);
      }

      await voteMessage.react('👍');
      await voteMessage.react('👎');

      const filter = (reaction) => ['👍', '👎'].includes(reaction.emoji.name);
      const reactions = await voteMessage.awaitReactions({ filter, time: timer * 1000 });
      const yesVotes = reactions.get('👍') ? reactions.get('👍').count - 1 : 0;
      const noVotes = reactions.get('👎') ? reactions.get('👎').count - 1 : 0;

      if (yesVotes > noVotes) {
      if (userId === '-1') {
        // Self-destruct the group chat
        await message.channel.send(`✅ The vote passed! Self-destructing the group chat...`);
        await client.emit('messageCreate', { ...message, content: '!selfdestruct' });
      } else {
        const response = await removeUserFromGroup(message.channel.id, userId);
        if (response.ok) {
        message.channel.send(`✅ <@${userId}> has been removed from the group chat.`);
        } else {
        const error = await response.text().catch(() => response.statusText);
        message.channel.send(`❌ Could not remove <@${userId}>: ${error}`);
        }
      }
      } else {
      message.channel.send(`❌ The vote failed. No action will be taken.`);
      }
    }

    // Commands to remove a specific user (Millx) - Only for the owner
    if (
      command === '!millxisannoying' ||
      command === '!kysmillx' ||
      command === '!stfumillx' ||
      (command === '!stfu' && args[0] === 'millx') ||
      (command === '!millx' && args[0] === 'stfu')
    ) {
      if (message.author.id !== OWNER_ID) {
        await safeReply(message, '❌ You do not have permission to run this command.');
        return;
      }
      const targetUserId = '720022112466894970'; // Example: The user to remove
      const response = await removeUserFromGroup(message.channel.id, targetUserId);
      if (response.ok) {
        await safeReply(message, "✅ Removed Millx");
      } else {
        const error = await response.text().catch(() => response.statusText);
        await safeReply(message, `❌ Error while removing Millx: ${error}`);
      }
    }

    // !debug - only for the owner, fetch relationships for testing
    if (command === '!debug') {
      if (message.author.id !== OWNER_ID) {
        await safeReply(message, '❌ You do not have permission to run this command.');
        return;
      }
      const testData = await fetchUserRelationships();
      await safeReply(message, 'test ' + testData);
    }



    // !selfdestruct - remove all users in the channel then create new group:
    if (command === '!selfdestruct') {

      if (message.author.id !== OWNER_ID) {
        await safeReply(message, '❌ You do not have permission to run this command.');
        return;
      }

      const channelData = await getChannelData(message.channel.id);
      if (!channelData || !channelData.recipients) {
        await safeReply(message, '❌ Could not fetch channel recipients.');
        return;
      }

      // Remove all members except selfbot
      const memberIds = channelData.recipients.map(member => member.id);
      for (const memberId of memberIds) {
        if (memberId !== BOT_USER_ID) {
          try {
            await removeUserFromGroup(message.channel.id, memberId);
            if (DEBUG_MODE) console.log(`[DEBUG] Removed member: ${memberId}`);
          } catch (err) {
            await safeReply(message, `❌ Error removing member: ${err}`);
          }
        }
      }

      // Attempt to remove self from the channel
      try {
        await removeUserFromGroup(message.channel.id, client.user.id);
        if (DEBUG_MODE) console.log(`[DEBUG] Removed self from channel: ${message.channel.id}`);
      } catch (err) {
        await safeReply(message, `❌ Error leaving group chat: ${err}`);
      }

      // Create a new group chat with only friends
      try {
        const friendIds = await fetchUserRelationships();
        const recipients = memberIds.filter(id => friendIds.includes(id));
        const nonFriends = memberIds.filter(id => !friendIds.includes(id));

        const response = await fetch("https://discord.com/api/v9/users/@me/channels", {
          headers: {
            'Authorization': TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ recipients }),
          method: 'POST'
        });

        const newChannel = await response.json();
        if (newChannel && newChannel.id) {
          await safeReply(message, `✅ Created a new group chat: ${newChannel.id}`);
          console.log(`[INFO] Created a new group chat: ${newChannel.id}`);
          await client.channels.cache.get(newChannel.id).send("@everyone **KABOOM!** Welcome to the new groupchat");
          if (nonFriends.length > 0) {
            const nonFriendMentions = nonFriends.map(id => `<@${id}>`).join(', ');
            await client.channels.cache.get(newChannel.id).send(`❌ Could not add non-friend users: ${nonFriendMentions}`);
          }
        } else {
          await safeReply(message, '❌ Error creating new group chat.');
          console.error('[ERROR] Failed to create a new group chat.');
        }
      } catch (error) {
        await safeReply(message, `❌ Error creating new group chat: ${error}`);
        console.error(`[ERROR] Failed to create a new group chat: ${error}`);
      }
    }
  } catch (error) {
    console.error(chalk.red(`[ERROR]`), `Unhandled error in messageCreate: ${error}`);
    await safeReply(message, `❌ An unexpected error occurred: ${error.message}`);
  }
});


// friend request handler
// automatically accepts
client.on('raw', async (packet) => {
  if (packet.t === 'RELATIONSHIP_ADD' && packet.d.type === 3) { // type 3 indicates a friend request
    try {
      await client.api.users('@me').relationships(packet.d.id).put({ data: { type: 1 } });
      const user = await client.users.fetch(packet.d.id);
      console.log(`Accepted friend request from ${user.username}`);
    } catch (error) {
      console.error(`Failed to accept friend request from user ID ${packet.d.id}:`, error);
    }
  }
});



/**
 * Log into Discord with the given token.
 * On success, a confirmation message is printed.
 */
client.login(TOKEN)
  .then(() => console.log(chalk.blue(`[INFO]`), 'Client logged in successfully.'))
  .catch(err => {
    if (err.message.includes('invalid token')) {
      console.error(chalk.red(`[ERROR]`), 'The provided token is invalid! Check your config');
    } else {
      console.error(chalk.red(`[ERROR]`), 'Failed to login:', err);
    }
  });