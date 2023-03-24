import { Serialize, SerializeProperty } from "ts-serializer";
import WsMessageBase from "../WsMessageBase";
import { WsMessageType } from "../WsMessagesTypes";
import ChatListItem from "../../models/ChatListItem";

@Serialize({})
export default class WSChatListMessage extends WsMessageBase{
    @SerializeProperty()
    readonly type = WsMessageType.chatList;
    @SerializeProperty()
    chats:ChatListItem[];
    constructor(...chats:ChatListItem[]){
        super();
        this.chats = chats;
    }
}