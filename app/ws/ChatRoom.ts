import Chat from "../db/Models/Chat";
import ChatMessage from "../db/Models/ChatMessage";
import WSClient from "./WsClient/WSClient";
import { WsMessageType } from "./WsMessagesTypes";
import Emitter, { Event } from "../../core/Events/Emitter";
import WsClientTextMessage from "./ws_client_messages/WsClientTextMessage";

type MessageEventHandler = { (message:WsClientTextMessage, client:WSClient):void }
type CloseEventHandler = { (client:WSClient, code:number, reson:Buffer):void };

export default class ChatRoom{
    private _clients:WSClient[] = [];
    private _emitter = new Emitter();
    /** readonly array of clients */
    public get clients(){
        return [...this._clients];
    }
    public chatId:number;
    public messageEvent = new Event<MessageEventHandler>("message",this._emitter);
    public closeEvent = new Event<CloseEventHandler>("close",this._emitter);
    constructor(chatId:number){
        this.chatId = chatId;
    }
    public write(message:ChatMessage){
        this._clients.forEach((client)=>{
            const data = message.serialize();
            const messageRaw = JSON.stringify({ type:WsMessageType.chat, ...data });
            client.socket.send(messageRaw);
        });
    }
    add(client:WSClient){
        this._clients.push(client);
        client.socket.addListener("message", (data)=>{
            const json = JSON.parse(data.toString());
            switch(json?.type){
                case(WsMessageType.chat):
                    const message = new WsClientTextMessage(json);
                    this._emitter.emit(this.messageEvent.name,message, client);
                break;
            }
        });
        client.socket.addListener("close",(code, reson)=>{
            const userId = client.userInfo?.user.id;
            client.dispose();
            this._clients.splice(this._clients.indexOf(client),1);
            this._emitter.emit(this.closeEvent.name, client, code, reson);
            console.log(this._clients);
            console.log(`[CHAT #${this.chatId}] User #${userId} exit with code ${code}.\n Reson: ${reson.toString()}.`);
        });
        client.socket.addListener("error", (err)=>{
            console.error(`[CHAT #${this.chatId}][USER #${client.userInfo?.user.id}] Error:`);
            console.error(err);
        })
    }
    dispose(){
        this._emitter.removeAllListeners();
        this.clients.forEach((client)=>client.dispose());
    }
}