require('dotenv').config();
const { Client, Intents } = require('discord.js');
const app = require('./previlepsion');
app.initialize();

const client = new Client({ intents: [
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILDS
]});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
  app.processMessage(message);
});

client.login(process.env.DISCORD_BOT_TOKEN);