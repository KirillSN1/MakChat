import { Serializable, Serialize, SerializeProperty } from "ts-serializer";
import { WsMessageType } from "./WsMessagesTypes";

export default abstract class WsMessageBase extends Serializable{
    abstract readonly type:WsMessageType
    toJson():string{
        return JSON.stringify(this.serialize());
    }
}