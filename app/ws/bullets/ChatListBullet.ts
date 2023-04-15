import { Serialize, SerializeProperty } from "ts-serializer";
import Bullet from "../Bullet";
import { BulletType } from "../BulletType";
import ChatListItem from "../../models/ChatListItem";

@Serialize({})
export default class ChatListBullet extends Bullet<ChatListItem[]>{
    @SerializeProperty()
    readonly type = BulletType.chatList;
    @SerializeProperty()
    readonly data:ChatListItem[];
    constructor(...data:ChatListItem[]){
        super();
        this.data = data;
    }
}