import { Serialize, SerializeProperty } from "ts-serializer";
import WsMessageBase from "../WsMessageBase";
import { WsMessageType } from "../WsMessagesTypes";

@Serialize({})
export default class WsServerConnectResponseMessage extends WsMessageBase{
    @SerializeProperty()
    readonly type: WsMessageType = WsMessageType.connection;
    @SerializeProperty()
    readonly connected: boolean;
    static success(){
        return new WsServerConnectResponseMessage(true);
    }
    static reject(){
        return new WsServerConnectResponseMessage(false);
    }
    constructor(connected:boolean){
        super();
        this.connected = connected;
    }
}