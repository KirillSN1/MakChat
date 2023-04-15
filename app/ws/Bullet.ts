import { Serializable, Serialize, SerializeProperty } from "ts-serializer";
import { BulletType } from "./BulletType";

/**
 * Сообщение отправляемое клиенту (посродством WebSocket), имеющее идентификатор [type]
 */
export default abstract class Bullet<T> extends Serializable{
    abstract readonly type:BulletType
    abstract readonly data:T
    toJson():string{
        return JSON.stringify(this.serialize());
    }
}