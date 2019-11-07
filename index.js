require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
var moment = require('moment');
const JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;

var db = new JsonDB(new Config("archeage", true, false, '/'));

// db.push('/chars', {
//   Labrys: {labor: 0, date: null},
//   Mutant: {labor: 0, date: null},
//   Hadley: {labor: 0, date: null},
//   Klarion: {labor: 0, date: null},
//   Eonic: {labor: 0, date: null},
//   Dazzler: {labor: 0, date: null},
//   Vue: {labor: 0, date: null},
//   Kekambas: {labor: 0, date: null},
//   Atami: {labor: 0, date: null},
//   LittleLady: {labor: 0, date: null},
// }, true);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async msg => {
  var chars = db.getData("/chars");
  if(msg.channel.name === 'chars'){
    if (msg.content.toLowerCase().includes('!set')) {
      let [command, char, labor] = msg.content.split(' ');
      char = char[0].toUpperCase()+ char.slice(1).toLowerCase();

      if(labor < 0 ){
        labor = 0;
      }

      chars[char].labor = labor;
      chars[char].date = moment();
      db.push('/chars', chars);
      await msg.channel.bulkDelete(10);
      msg.reply(`Saved!`).then(msg => {
        msg.delete(1000);
      });
    }
    if(msg.content === '!status'){
      const embed = new Discord.RichEmbed()
          .setTitle("Character summary")
          .setColor(0x00AE86)

      Object.keys(chars).forEach(char => {
        var diffMins =   moment().diff(chars[char].date, 'minutes')

        var accumulatedIterations = Math.round(diffMins / 5);

        var accumulatedLabor =  parseInt(chars[char].labor) + (10 * accumulatedIterations);

        accumulatedLabor = accumulatedLabor > 5000  ? 5000 : accumulatedLabor;
        embed.addField(char, `Generated Labor: ${accumulatedLabor}`, true)
      })
      await msg.channel.bulkDelete(10);
      msg.reply({embed});
    }
  }
})

client.login(process.env.BOT_TOKEN)
