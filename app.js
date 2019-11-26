let moment = require('moment');
let _ = require('lodash');
let db = require('./database');
let helper = require('./helper');

module.exports = {
    async generateEmbed(laborEmbed, productionEmbed) {
        let chars = await db.getChars();

        await this.generateChars(chars, laborEmbed);
        await this.generateProduction(chars, productionEmbed);
        // await this.generatePlants(embed);

        return [laborEmbed, productionEmbed];
    },

    async setChar(char, labor){
        char = char.toLowerCase();

        if(labor < 10 ){
            labor = 10;
        }

        await db.setChar(char, labor);
    },

    async generateChars(chars, embed) {
        chars.forEach(char => {
            var diffMins = moment().diff(moment(char.updated_at), 'minutes');
            var accumulatedIterations = Math.round(diffMins / 5);
            var accumulatedLabor =  parseInt(char.labor) + (10 * accumulatedIterations);
            accumulatedLabor = accumulatedLabor > 5000  ? 5000 : accumulatedLabor;
            embed.addField(char.name, `Generated Labor: ${accumulatedLabor}`, true)
        });
    },

    async setProduction(char, type){
        type = type.toLowerCase();
        char = char.toLowerCase();
        await db.setProduction(char, type)
    },

    async deleteProduction(char, type){
        char = char.toLowerCase();
        type = type.toLowerCase();

        await db.deleteProduction(char, type)
    },

    async generateProduction(chars, embed) {
        let types = await db.getTypes();
        let production = await db.getProduction();

        for (const product of production) {
            let char = _.find(chars, o => o.id === product.char_id);
            let type = _.find(types, o => o.id === product.type_id);

            if(char && type){
                let time = helper.calculateProductTime(type.growth, product.planted_at);

                embed.addField('Character', char.name, true);
                embed.addField('Production Type', type.name, true);
                embed.addField('Ready in', time, true);
            }
        }
    },
}

