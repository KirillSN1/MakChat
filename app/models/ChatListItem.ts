import { Serializable, Serialize, SerializeProperty } from "ts-serializer";
import ChatMessage from "../db/Models/ChatMessage";
import Chat from "../db/Models/Chat";
import ChatParticipant from "../db/Models/ChatParticipant";

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
    static async from(chat:Chat, participant:ChatParticipant){
        const messagesCount = await ChatMessage.count({ 
            participantId:participant.id,
            id:{ operator:">", value:participant.lastReadedMessageId }
        });
        const lastMessage = await ChatMessage.findLast({ id:0 });//TODO:lastmessage
        return new ChatListItem(chat.id, chat.name, chat.type, messagesCount, lastMessage);
    }
}