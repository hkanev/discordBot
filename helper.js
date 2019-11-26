let moment = require('moment');
let _ = require('lodash');
let db = require('./database');

module.exports = {
    calculateProductTime(growth, planted_at){
        if(!growth || !planted_at){
            return null;
        }

        let [hours, mins] = growth.split(':');
        let growthAt = moment(planted_at)
            .add(hours, 'hours').
            add(mins, 'mins');
        let now = moment();

        let time;

        if(growthAt.isBefore(now)){
            time = 'Done'
        } else {
            let duration = growthAt.diff(now, 'milliseconds');
            let r = moment.utc(duration);
            time = r.format("HH:mm");
        }

        return time;
    },

};