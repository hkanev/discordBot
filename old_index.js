require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
var moment = require('moment');
const { Pool } = require('pg');
var _ = require('lodash');

let pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.once('ready', () => {
    console.log('Ready!');
});

const { prefix } = config;

client.on('message', message => {
    if (message.content === prefix + 'ping') {
        message.channel.send('Pong.');
    } else if (message.content === prefix + 'beep') {
        message.channel.send('Boop.');
    } else if (message.content === prefix + 'server') {
        message.channel.send('Guild name: ' + message.guild.name + '\nTotal members: ' + message.guild.memberCount);
    } else if (message.content === prefix + 'user-info') {
        message.channel.send('Your username: ' + message.author.username + '\nYour ID: ' + message.author.id);
    }
});

client.login(config.token);