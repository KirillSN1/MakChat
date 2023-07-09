import { IncomingMessage, Server } from "http";
import { MessageEvent, WebSocket, WebSocketServer } from "ws";
import WSClient, { WsClientStatus } from "./WsClient/WSClient";
import { AuthInfo } from "../auth/Auth";

export default class WebSocketRouter{
    private readonly serverSocket:WebSocketServer;
    private _clients:WSClient[] = [];
    private static _routes:WSRoute[] = [];
    public get clients() { return [...this._clients]; }
    // private _rooms:Map<number,ChatRoom> = new Map<number,ChatRoom>();
    private static singleton?:WebSocketRouter;
    // static get instance(){ return this.singleton; }
    public static getClient(userId:number):WSClient | undefined;
    public static getClient(token:String):WSClient | undefined;
    public static getClient(authInfo:AuthInfo):WSClient | undefined;
    public static getClient(searchData:number|String|AuthInfo):WSClient | undefined{
        if(!this.singleton) throw new Error(`You have to call init before.`);
        return this.singleton.clients.find((client)=>client.authInfo != null &&
            (client.authInfo == searchData ||
            client.authInfo.token == searchData ||
            client.authInfo.user.id == searchData)
        );
    }
    private constructor(server:Server){
        this.serverSocket = new WebSocketServer({ server,  });
        this.serverSocket.on("connection", (...p)=>this.onClientConnect(...p));
    }
    public static init(server:Server){
        return this.singleton || (this.singleton = new WebSocketRouter(server));
    }
    private onClientConnect(socket:WebSocket, request:IncomingMessage){
        const client = new WSClient(socket);
        const index = this._clients.push(client) - 1;
        client.onConnected.on((authInfo)=>this.onUserAttached(client,authInfo));
        client.changeStatusEvent.on((status)=>{
            console.log(`wss client[${index}](${client.authInfo?.user.id}): ${WsClientStatus[status]}`);
            console.log(`wss clients:${JSON.stringify(this._clients.map(c=>({ userId:c.authInfo?.user.id, status:c.status })))}`);
            switch(status){
                case(WsClientStatus.REJECTED_BY_SERVER):
                case(WsClientStatus.REJECTED_BY_CLIENT):
                case(WsClientStatus.DISPOSED):
                    this._clients.splice(index, 1);
                    break;
            }
        });
    }
    private async onUserAttached(client: WSClient, authInfo:AuthInfo) {
        client.socket.addEventListener('message',(event:MessageEvent)=>{
            const json = JSON.parse(event.data.toString());
            if(!json?.type) return;
            const route = WebSocketRouter._routes.find((route)=>route.name == json.type);
            if(!route) return;
            try{
                route.handler(json, authInfo);
            } catch(e) {
                console.error(`Error in ws route "${route.name}:"`);
                console.error(e);
            }
        })
    }
    static on(messageType:string,handler:WebSocketRouterHandler){
        WebSocketRouter._routes.push(new WSRoute(messageType,handler))
    }
}
type WebSocketRouterHandler = { (json:any,authInfo:AuthInfo):void }

class WSRoute{
    name:string;
    handler:WebSocketRouterHandler;
    constructor(name:string,handler:WebSocketRouterHandler){
        this.name = name;
        this.handler = handler;
    }
}