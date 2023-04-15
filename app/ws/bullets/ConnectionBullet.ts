import { Serialize, SerializeProperty } from "ts-serializer";
import Bullet from "../Bullet";
import { BulletType } from "../BulletType";

@Serialize({})
export default class ConnectionBullet extends Bullet<number>{
    @SerializeProperty()
    readonly type: BulletType = BulletType.connection;
    @SerializeProperty()
    readonly data: number;
    static success(userId:number){
        return new ConnectionBullet(userId);
    }
    static reject(){
        return new ConnectionBullet(0);
    }
    constructor(userId:number){
        super();
        this.data = userId;
    }
}