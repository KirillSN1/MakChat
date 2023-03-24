import { Serializable, Serialize, SerializeProperty } from "ts-serializer";
import ChatMessage from "../db/Models/ChatMessage";

@Serialize({})
export default class ChatListItem extends Serializable{
    @SerializeProperty()
    readonly id:number;
    @SerializeProperty()
    readonly name:string;
    @SerializeProperty()
    readonly type:number;
    @SerializeProperty()
    readonly messagesCount:number;
    @SerializeProperty()
    readonly lastMessage?:ChatMessage;
    constructor(chatId:number, chatName:string, chatType:number, messagesCount:number, lastMessage?:ChatMessage){
        super();
        this.id = chatId;
        this.name = chatName;
        this.type = chatType;
        this.messagesCount = messagesCount;
        this.lastMessage = lastMessage;
    }
}