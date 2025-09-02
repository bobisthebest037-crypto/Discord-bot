// ===== Require packages =====
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// ===== Express server to keep Replit alive =====
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(port, () => console.log(`Web server running on port ${port}`));

// ===== Discord bot setup =====
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,              // Required for guild info
    GatewayIntentBits.GuildMessages,       // Required to read messages
    GatewayIntentBits.MessageContent,      // Required to read message content
    GatewayIntentBits.GuildMessageReactions, // Required to detect reactions
    GatewayIntentBits.GuildMembers         // Required to fetch roles
  ] 
});

// ===== Your channel and role IDs =====
const popularChannelID = '1412124362521448498';
const reviewChannelID  = '1412126301975871659';
const deniedChannelID  = '1412127938991882300';
const adminRoleID      = '1409144176620208139';

// ===== Bot ready log =====
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// ===== Reaction handler =====
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; // Ignore bot reactions
    if (!reaction.message.guild) return;

    // Fetch the member to check roles
    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member.roles.cache.has(adminRoleID)) return; // Only admins

    const content = reaction.message.content;

    // ✅ Suggestion approved
    if (reaction.emoji.name === '✅') {
        const channel = reaction.message.guild.channels.cache.get(popularChannelID);
        if (channel) {
            channel.send(`✅ Suggestion approved by ${user.username}:\n${content}`);
        }
    } 

    // ❌ Suggestion denied
    else if (reaction.emoji.name === '❌') {
        const channel = reaction.message.guild.channels.cache.get(deniedChannelID);
        if (channel) {
            channel.send(`❌ Suggestion denied by ${user.username}:\n${content}`);
        }
    }
});

// ===== Login with token from Replit Secrets =====
client.login(process.env.DISCORD_TOKEN);