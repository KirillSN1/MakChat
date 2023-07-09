import { Serialize, SerializeProperty } from "ts-serializer";
import Bullet from "../Bullet";
import { BulletType } from "../BulletType";
import ChatListItem from "../../models/ChatListItem";

export enum ChatListEventType { add='add', remove='remove', update='update' }

@Serialize({})
abstract class ChatListBulletData {
    @SerializeProperty()
    abstract chats:ChatListItem[];
    @SerializeProperty()
    abstract type:ChatListEventType;
}

@Serialize({})
export default class ChatListBullet extends Bullet<ChatListBulletData>{
    @SerializeProperty()
    readonly type = BulletType.chatList;
    @SerializeProperty()
    readonly data:ChatListBulletData;
    constructor(data:ChatListBulletData){
        super();
        this.data = data;
    }
}