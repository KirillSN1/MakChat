import { WsMessageType } from "../WsMessagesTypes";

export default class WsClientConnectMessage{
    public readonly token:string;
    constructor(data:{ token:string, chatId:number }){
        this.token = data.token;
    }
}