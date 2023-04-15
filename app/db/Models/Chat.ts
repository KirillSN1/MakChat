import { Serialize, SerializeProperty } from "ts-serializer";
import InvalidArgumentError from "../../errors";
import DB from "../DB";
import Model from "../Model";
import AppUser from "./AppUser";
import ChatType from "./ChatType";
import { DBType } from "../DBType";
import { Knex } from "knex";
import ChatParticipant from "./ChatParticipant";
import Env from "../../../env";

type SelectData = { 
    id?: DBType<number>,
    name?:DBType<string>,
    type?:DBType<number>,
}

@Serialize({})
export default class Chat extends Model{
    protected static tablename: string = "Chat";
    @SerializeProperty()
    public readonly id:number;
    @SerializeProperty()
    public readonly name:string;
    @SerializeProperty()
    public readonly type:number;
    constructor(data:any){
        super();
        console.log(data);
        const required = ['id','name','type'];
        for(const key of required) 
            if(!data[key]) throw new InvalidArgumentError("data");
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
    }
    static async createSingle(name:string){//TODO:убрать name, определять имя пользователя
        const client = DB.connect();
        const chatType = (await ChatType.uwu).id;
        const sql = `INSERT INTO "Chat" ("name", "type") VALUES ($1, $2) RETURNING "id";`;
        const result = await client.query(sql,[name,chatType]);
        return this.find({ id:result.rows[0].id });
    }
    static async create(name:string) {
        const chatType = (await ChatType.uwu).id;
        return (await this.getKnex<Chat>().insert({ type:chatType, name },"*"))[0];
    }
    static async find(data:SelectData){
        return new Chat((await this.getKnex<Chat>().select('*').where(data))[0]);
    }
    static async findAll(data:any,limit?:number){
        let builder = this.getKnex<Chat>().select("*").limit(limit??Env.DEFAULT_CHATS_COUNT_LIMIT);
        if(data) builder = builder.where(data);
        return await builder;
        // return (await super.findAll(data,limit)).map(chatData=>new Chat(chatData));
    }
    static query(){
        return this.getKnex<Chat>();
    }
}