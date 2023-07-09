import { Serialize, SerializeProperty } from "ts-serializer";
import Bullet from "../Bullet";
import { BulletType } from "../BulletType";
import ChatMessage from "../../db/Models/ChatMessage";
import ChatHistoryMessage from "../../db/Views/ChatHistoryMessage";
import ChatParticipant from "../../db/Models/ChatParticipant";

export abstract class ChatMessageBulletData{
    abstract id:number;
    abstract userId:number;
    abstract status:number; 
    abstract text:string;
    abstract chatId:number;
    abstract created_at:number;
    abstract updated_at:number;
    static from(message:ChatHistoryMessage):ChatMessageBulletData;
    static from(message:ChatMessage, participant:ChatParticipant):ChatMessageBulletData;
    static from(message:any, participant?:ChatParticipant):ChatMessageBulletData{
        return { 
            id:message.id,
            chatId:participant?.chat || message.chatId,
            userId:participant?.appUser || message.appUser,
            status:message.status, 
            text:message.text,
            created_at:message.created_at,
            updated_at:message.updated_at
        };
    }
}
@Serialize({})
export default class ChatMessageBullet extends Bullet<ChatMessageBulletData>{
    @SerializeProperty()
    readonly type: BulletType = BulletType.chat;
    @SerializeProperty()
    readonly data: ChatMessageBulletData;
    constructor(data:ChatMessageBulletData){
        super();
        this.data = data;
    }
}