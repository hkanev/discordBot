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

async function getPlants(){
    const db = await pool.connect();
    try{
        var response =  await db.query('SELECT * FROM public.plants WHERE is_visible = true');
    } catch (e) {
        console.log(e);
    }

    db.release();
    return response.rows;
}

async function generateEmbed(){
    const embed = new Discord.RichEmbed()
        .setTitle("Family summary")
        .setColor(0x00AE86);

    await generateChars(embed);
    await generatePlants(embed);

    return embed;
}

async function generateChars(embed) {
    let chars = await getChars();
    chars.forEach(char => {
        var diffMins = moment().diff(moment(char.updated_at), 'minutes');
        var accumulatedIterations = Math.round(diffMins / 5);
        var accumulatedLabor =  parseInt(char.labor) + (10 * accumulatedIterations);
        accumulatedLabor = accumulatedLabor > 5000  ? 5000 : accumulatedLabor;
        embed.addField(char.name, `Generated Labor: ${accumulatedLabor}`, true)
    });
}

async function generatePlants(embed) {

    let plants = await getPlants();
    if(plants){
        embed.addBlankField();
        plants.forEach(plant => {
            let [hours, mins] = plant.growth.split(':');
            let growthAt = moment(plant.planted_at)
                .add(hours, 'hours').
                add(mins, 'mins');
            let now = moment();

            let result;
            if(growthAt.isBefore(now)){
                result = 'Done'
            } else {
                let duration = growthAt.diff(now, 'milliseconds');
                let r = moment.utc(duration);
                result = `Estimated time to completion: ${r.format("HH:mm")} hours`;
            }

            embed.addField(`**${plant.name}**`,   result);
        } )
    }
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async msg => {
    if(msg.channel.name === 'bot'){
        if (msg.content.toLowerCase().includes('set')) {
            let [command, char, labor] = msg.content.split(' ');
            char = char.toLowerCase();

            if(labor < 0 ){
                labor = 0;
            }

            const db = await pool.connect();
            var query = "UPDATE public.chars SET labor = ($1), updated_at = ($2) WHERE system_name = ($3)";
            await db.query(query, [labor, moment(), char]).then(async () => {
                    let embed =  await generateEmbed();
                    await msg.channel.bulkDelete(10);
                    msg.channel.send({embed});
                }
            );
            db.release();
        }
        if(msg.content.toLowerCase() === 'refresh'){
            let embed =  await generateEmbed();
            await msg.channel.bulkDelete(10);
            msg.channel.send({embed});
        }
        if(msg.content.toLowerCase().includes('plant')){
            let [command, plant] = msg.content.split(' ');
            plant = plant.toLowerCase();
            const db = await pool.connect();
            let query = "UPDATE public.plants SET planted_at = ($1), is_visible = ($2) WHERE system_name = ($3)";
            await db.query(query, [moment(), true, plant])
                .then(async () => {
                    let embed =  await generateEmbed();
                    await msg.channel.bulkDelete(10);
                    msg.channel.send({embed});
                })
                .catch(e => console.log(e));
            db.release();
        }
        if(msg.content.toLowerCase().includes('collect')){
            let [command, plant] = msg.content.split(' ');
            plant = plant.toLowerCase();
            const db = await pool.connect();
            let query = "UPDATE public.plants SET planted_at = ($1), is_visible = ($2) WHERE system_name = ($3)";
            await db.query(query, [moment(), false, plant])
                .then(async () => {
                    let embed =  await generateEmbed();
                    await msg.channel.bulkDelete(10);
                    msg.channel.send({embed});
                })
                .catch(e => console.log(e));
            db.release();
        }
    }
});

client.login(process.env.BOT_TOKEN);