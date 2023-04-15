import { Serialize, SerializeProperty } from "ts-serializer";
import Bullet from "../Bullet";
import { BulletType } from "../BulletType";

export abstract class ChatMessageBulletData{
    abstract id:number;
    abstract userId:number;
    abstract status:number; 
    abstract text:string;
    abstract created_at:number;
    abstract updated_at:number;
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