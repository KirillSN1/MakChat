import { Serializable } from "ts-serializer";
import DB from "./DB";
import { DBTypeParser } from "./DBType";
import { knex, Knex } from 'knex';

/**
 * Базовая модель базы данных.
 * Совет: Название дочернего класса должно соответствовать названию таблицы
 * Если нужно указать иное название следует использовать поле tablename
 */
export default abstract class Model extends Serializable {
    protected static readonly tablename:string;
    protected static getKnex<T extends Model>() { return DB.Knex<T>(this.tablename || this.name); }
    static async testKnex(){
        return DB.Knex<Model>('AppUser').select("id")
    }
    static async count(data:object,limit?:number, order?:{ column:string, dir:string }){
        const client = DB.connect();
        const paramName = "count";
        const sql = `SELECT COUNT(*) as ${paramName} FROM "${this.tablename || this.name}"
        WHERE ${Object.entries(data).map(param=>`"${param[0]}"${DBTypeParser.get(param[1])}`).join(" AND ")}
        ${order?`ORDER BY ${order.column} ${order.dir}`:''}`;
        const result = await client.query(sql+(limit?` LIMIT ${limit}`:""));
        return Number(result.rows[0][paramName]);
    }
}