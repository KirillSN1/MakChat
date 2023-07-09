import DB from "../DB";
import { DBType, DBTypeParser as DBTypeSerialiser } from "../DBType";
import Model from "../Model";
import { Serialize, SerializeProperty } from "ts-serializer";

type SelectData = {
    id?:DBType<number>,
    participantId?:DBType<number>,
    text?:DBType<string> 
    created_at?:DBType<number>
    updated_at?:DBType<number>
}
@Serialize({})
export default class ChatMessage extends Model{
    @SerializeProperty() readonly id:number = 0;
    @SerializeProperty() readonly participantId:number = 0;
    @SerializeProperty() readonly text:string = "";
    @SerializeProperty() created_at:number = 0;
    @SerializeProperty() updated_at:number = 0;
    @SerializeProperty() readonly status:number = 0;
    
    static readonly knex = ChatMessage.getKnex<ChatMessage>();
    static async create(participantId:number, text:string, time:number){
        const data = await this.knex.insert({ participantId, text, created_at:time, updated_at:time },"*");
        const instance = new ChatMessage();
        instance.deserialize(data[0]);
        return instance;
    }
    static async find(data: SelectData) {
        const client = DB.connect();
        const params = Object.entries(data);
        const toSqlParam = (param:[string,DBType<any>],i:number)=>`"${param[0]}" ${DBTypeSerialiser.operator(param[1])} $${i+1} `;
        const sql = `SELECT * FROM "${this.tablename || this.name}" WHERE` + params.map(toSqlParam).join(" AND ");
        const result = await client.query(sql,params.map(e=>e[1]));
        if(!result.rows[0]) return undefined;
        const instance = new ChatMessage();
        instance.deserialize(result.rows[0]);
        return instance;
    }
    static async findLast(data:SelectData){
        // this.knex<ChatMessage>().where
        const row = await this.getKnex<ChatMessage>().select('*').where(data);
        if(!row?.length) return undefined;
        const instance = new ChatMessage();
        instance.deserialize(row);
        return instance;
    }
    static async edit(id:number,text:string,time:number){
        const client = DB.connect();
        const result = await client.query(`UPDATE "ChatMessage" SET "text" = '${text}', "updated_at" = '${time}' WHERE "id" = '${id}'`);
    }
    static count(data: SelectData, limit?: number | undefined, order?: { column: string; dir: string; } | undefined): Promise<number> {
        return super.count(data,limit,order);
    }
    static query(){
        return this.getKnex<ChatMessage>();
    }
}