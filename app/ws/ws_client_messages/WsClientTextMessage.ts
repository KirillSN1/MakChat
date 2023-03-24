import { WsMessageType } from "../WsMessagesTypes";

export default class WsClientTextMessage{
    public readonly id:number = 0;
    public readonly text:string = "";
    public readonly dateTime:number = 0;
    constructor(data:{ id:number, text:string, dateTime:number }){
        this.id = data.id || 0;
        this.text = data.text || "";
        this.dateTime = data.dateTime || 0;
    }
}