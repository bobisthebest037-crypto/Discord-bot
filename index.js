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
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ] 
});

// ===== Your channel and role IDs =====
const popularChannelID = '1412124362521448498';
const reviewChannelID  = '1412126301975871659';
const deniedChannelID  = '1412127938991882300';

// ===== Roles allowed to approve/deny =====
const allowedRoles = [
  '1412505395691393117',
  '1412506954252947568',
  '1409132661565558914',
  '1409142790146883737',
  '1412507588528181298',
  '1412507348806668378',
  '1412504519727910943'
];

// ===== Bot ready log =====
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// ===== Reaction handler =====
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; 
    if (!reaction.message.guild) return;

    const member = await reaction.message.guild.members.fetch(user.id);

    // Check if member has at least one allowed role
    const hasRole = member.roles.cache.some(role => allowedRoles.includes(role.id));
    if (!hasRole) return;

    // Repost the original message as an embed
    const originalMessage = reaction.message;

    // If the message already has an embed, clone it
    let embedToSend;
    if (originalMessage.embeds.length > 0) {
        embedToSend = originalMessage.embeds[0].toJSON(); // clone existing embed
    } else {
        // If no embed, create a simple one
        embedToSend = {
            description: originalMessage.content,
            color: reaction.emoji.name === '✅' ? 0x00FF00 : 0xFF0000,
            author: {
                name: originalMessage.author.username,
                icon_url: originalMessage.author.displayAvatarURL()
            },
            footer: {
                text: `${reaction.emoji.name === '✅' ? 'Approved' : 'Denied'} by ${user.username}`
            },
            timestamp: new Date()
        };
    }

    if (reaction.emoji.name === '✅') {
        const channel = reaction.message.guild.channels.cache.get(popularChannelID);
        if (channel) channel.send({ embeds: [embedToSend] });
    } else if (reaction.emoji.name === '❌') {
        const channel = reaction.message.guild.channels.cache.get(deniedChannelID);
        if (channel) channel.send({ embeds: [embedToSend] });
    }
});

// ===== Login with token from Replit Secrets =====
client.login(process.env.DISCORD_TOKEN);