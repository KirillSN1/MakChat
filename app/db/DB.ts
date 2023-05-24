import knex, { Knex } from 'knex';
import Env from '../../env';
import { Client } from 'pg'

export default class DB{
    static client:Client;
    static knexClient: Knex;
    static connect(){
        if(DB.client) return DB.client;
        DB.client = new Client({
            host:Env.PGHOST,
            database:Env.PGDATABASE,
            password:Env.PGPASSWORD,
            port:Env.PGPORT,
            user:Env.PGUSER
        });
        DB.client.connect();
        return DB.client;
    }
    static get Knex():Knex{
        return DB.knexClient ?? (DB.knexClient = knex({
            debug:Env.DEBUG,
            asyncStackTraces:Env.DEBUG,// https://knexjs.org/guide/#asyncstacktraces
            dialect:"",
            client: 'pg',
            connection: {
                host : Env.PGHOST,
                port : Env.PGPORT,
                user : Env.PGUSER,
                password : Env.PGPASSWORD,
                database : Env.PGDATABASE
            }
        }));
    }
}