import { Serialize, SerializeProperty } from "ts-serializer";
import DB from "../DB";
import { DBType } from "../DBType";
import Model from "../Model";
type SelectData = {
    id?:DBType<number>;
    chat?:DBType<number>;
    role?:DBType<number>;
    appUser?:DBType<number>;
    lastReadedMessageId?:DBType<number>;
}
@Serialize({})
export default class ChatParticipant extends Model{
    static tablename = "";
    @SerializeProperty()
    id: number = 0;
    @SerializeProperty()
    chat:number = 0;
    @SerializeProperty()
    role:number = 0;
    @SerializeProperty()
    appUser:number = 0;
    @SerializeProperty()
    lastReadedMessageId:number = 0;
    static async create(data:{ chat:number; role:number; appUser:number }){
        const client = DB.connect();
        const result = await client.query(`INSERT INTO "ChatParticipant" ("chat", "role", "appUser")
            VALUES ('${data.chat}', '${data.role}', '${data.appUser}');`);
        return this.find(data);
    }
    static async find(data:SelectData){
        const result = await this.getKnex<ChatParticipant>().select("*").where(data).limit(1);
        const row = result[0];
        if(!row) return null;
        const instance = new ChatParticipant();
        instance.deserialize(row);
        return instance;
    }
    static async findAll(data:SelectData, limit?: number, order?: { column: string, dir: string }){
        let builder = ChatParticipant.query.select("*").where(data).limit(limit??Infinity);
        if(order?.column) builder = builder.orderBy(`${order?.column} ${order?.dir??""}`);
        return (await builder).map((row)=>{
            const instance = new ChatParticipant();
            instance.deserialize(row);
            return instance;
        });
    }
    /**
     * @param chatId A chat whose participants need to be found
     * @param userId The user for whom it is necessary to find the participants of the specified chat
     * @returns Participans of chat(chatId) for user(userId)
     */
    static for(chatId:Number,userId:Number){
        return ChatParticipant.query.where("chat",chatId).where("appUser","<>",userId);
    }
    static get query() {
        return this.getKnex<ChatParticipant>();
    }
}