require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const app = require('./app');

async function sendResponse(msg){
    let laborEmbed = new Discord.RichEmbed()
        .setTitle("Labor summary")
        .setColor(0x00AE86);

    let productionEmbed = new Discord.RichEmbed()
        .setTitle("Production summary")
        .setColor(0x00AE86);

    [laborEmbed, productionEmbed] = await app.generateEmbed(laborEmbed, productionEmbed);

    await msg.channel.bulkDelete(10)
        .catch(e => console.log(e));

    await  msg.channel.send(laborEmbed);
    if(productionEmbed.fields.length > 0){
        await  msg.channel.send(productionEmbed);
    }

}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on('message', async msg => {
    if(msg.channel.name === 'bot'){
        if (msg.content.toLowerCase().includes('set')) {
            let [command, char, labor] = msg.content.split(' ');
            await app.setChar(char, labor);
            await sendResponse(msg);
        }

        if(msg.content.toLowerCase() === 'refresh'){
            await sendResponse(msg);
        }

        if(msg.content.toLowerCase().includes('start')) {
            let [command, char, type] = msg.content.split(' ');
            await app.setProduction(char, type);
            await sendResponse(msg);
        }

        if(msg.content.toLowerCase().includes('delete')) {
            let [command, char, type] = msg.content.split(' ');
            await app.deleteProduction(char, type);
            await sendResponse(msg);
        }
    }
});

client.login(process.env.BOT_TOKEN);