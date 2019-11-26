require('dotenv').config();
const moment = require('moment');
const { Pool } = require('pg');

let pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

module.exports = {
    async getChars(){
        const db = await pool.connect();
        try{
            var response =  await db.query('SELECT * FROM public.chars');
        } catch (e) {
            console.log(e);
        }

        db.release();
        return response.rows;
    },

    async setChar(char, labor){
        const db = await pool.connect();
        var query = "UPDATE public.chars SET labor = ($1), updated_at = ($2) WHERE system_name = ($3)";
        await db.query(query, [labor, moment(), char]);
        db.release();
    },

    async getTypes() {
        const db = await pool.connect();
        try{
            let query = 'SELECT * FROM public.types';
            var response =  await db.query(query).catch(e => console.log(e));
        } catch (e) {
            console.log(e);
        }

        db.release();
        return response.rows;
    },

    async setProduction(char, type) {
        const db = await pool.connect();

        let charQB = await db.query('SELECT * FROM public.chars WHERE system_name = ($1)', [char]);
        let typeQB = await db.query('SELECT * FROM public.types WHERE system_name = ($1)', [type]);

        char = charQB.rows ? charQB.rows[0] : null;
        type = typeQB.rows ? typeQB.rows[0] : null;

        if(char && type){
            let query = "INSERT INTO public.production(planted_at, char_id, type_id) VALUES($1, $2, $3)";
            await db.query(query, [moment(), char.id, type.id])
                .catch(e => console.log(e));
        }

        db.release();
    },

    async getProduction(){
        const db = await pool.connect();
        try{
            let query = 'SELECT * FROM public.production';
            var response =  await db.query(query);
        } catch (e) {
            console.log(e);
        }

        db.release();
        return response.rows;
    },

    async deleteProduction(char, type) {
        const db = await pool.connect();

        let charQB = await db.query('SELECT * FROM public.chars WHERE system_name = ($1)', [char]);
        let typeQB = await db.query('SELECT * FROM public.types WHERE system_name = ($1)', [type]);

        char = charQB.rows ? charQB.rows[0] : null;
        type = typeQB.rows ? typeQB.rows[0] : null;

        if (char && type) {
            await db.query('DELETE FROM public.production WHERE char_id = ($1) AND type_id = ($2)', [char.id, type.id])
        }

        db.release();
    }
};

