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
import { UserJwt } from "../../auth/Auth";

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
        const required = ['id','name','type'];
        for(const key of required) 
            if(!data[key]) throw new InvalidArgumentError("data");
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
    }
    static async createSingle(name:string){
        const client = DB.connect();
        const chatType = (await ChatType.uwu).id;
        const sql = `INSERT INTO "Chat" ("name", "type") VALUES ($1, $2) RETURNING "id";`;
        const result = await client.query(sql,[name,chatType]);
        return this.find({ id:result.rows[0].id });
    }
    static async create(name:string) {//TODO:Chat type param
        const chatType = (await ChatType.uwu).id;
        return new Chat((await this.getKnex<Chat>().insert({ type:chatType, name },"*"))[0]);
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
    /**
     * Преобразут переданный объект в экземпляр класса Chat, затем
     * возвращает копию текущего объекта чата с учетом переданного пользователя:
     * 
     * Меняет название чата в соответствие с типом чата и участником чата.
     * 
     * *Присутствует обращение к БД
     * 
     */
    static for(data:any, user?:AppUser){
        return new Chat(data).for(user);
    }
    /** 
     * Возвращает копию текущего объекта чата с учетом переданного пользователя:
     * 
     * Меняет название чата в соответствие с типом чата и участником чата.
     * 
     * *Присутствует обращение к БД
     */
    async for(user?:AppUser){
        var name = this.name;
        if(user)
            switch(this.type){
                case(ChatType.uwu.id):
                    const otherParticipant = await ChatParticipant.of(this.id).where("appUser","<>",user.id).select("appUser").first();
                    const otherUser = otherParticipant?.appUser?await AppUser.find({ id:otherParticipant.appUser }): undefined;
                    name = otherUser?.name || otherUser?.login || name;
                    break;
                default:break;
            }
        return new Chat({ id:this.id, name, type:this.type });
    }
    static query(){
        return this.getKnex<Chat>();
    }
}