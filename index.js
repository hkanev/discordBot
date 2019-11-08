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


var chars = null;

async function getChars(){
  const db = await pool.connect();
  try{
    var response =  await db.query('SELECT * FROM public.chars');
  } catch (e) {
    console.log(e);
  }

  db.release();
  return response.rows;
}


client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async msg => {
  if(msg.channel.name === 'chars'){
    if (msg.content.toLowerCase().includes('!set')) {
      let [command, char, labor] = msg.content.split(' ');
      char = char.toLowerCase();

      if(labor < 0 ){
        labor = 0;
      }

      const db = await pool.connect();
      var query = "UPDATE public.chars SET labor = ($1), updated_at = ($2) WHERE system_name = ($3)";
      await db.query(query, [labor, moment(), char]).then(async () => {
            await msg.channel.bulkDelete(10);
            msg.reply(`Saved!`).then(msg => {
              msg.delete(1000);
            });
          }
      );
      db.release();
    }
    if(msg.content === '!status'){
      const embed = new Discord.RichEmbed()
          .setTitle("Character summary")
          .setColor(0x00AE86)
      var chars = await getChars();
      chars.forEach(char => {
        var diffMins = moment().diff(moment(char.updated_at), 'minutes');
        var accumulatedIterations = Math.round(diffMins / 5);
        var accumulatedLabor =  parseInt(char.labor) + (10 * accumulatedIterations);
        accumulatedLabor = accumulatedLabor > 5000  ? 5000 : accumulatedLabor;
        embed.addField(char.name, `Generated Labor: ${accumulatedLabor}`, true)
      })

      await msg.channel.bulkDelete(10);
      msg.reply({embed});
    }
  }
})

client.login(process.env.BOT_TOKEN)