import WebSocket, { RawData } from "ws";
import Emitter, { Event } from "../../../core/Events/Emitter";
import Auth, { AuthInfo, InvalidTokenError } from "../../auth/Auth";
import InvalidArgumentError from "../../errors";
import WsClientConnectMessage from "../ws_client_messages/WsClientConnectMessage";
import WsServerConnectResponseMessage from "../ws_server_messages/WsServerConnectMessage";
import WSCloseCode from "../WSCloseCodes";

type ChangeStatusHandler = { (status:WsClientStatus):void }
type ConnectHandler = { (authInfo:AuthInfo):void }
export default class WSClient {
    readonly socket: WebSocket;
    private _status: WsClientStatus = WsClientStatus.WAIT_FOR_CONNECT;
    private _userInfo: AuthInfo | null = null;
    private readonly emitter = new Emitter();
    public readonly changeStatusEvent = this.emitter.createEvent<ChangeStatusHandler>("changeStatus");
    public readonly onConnected = this.emitter.createEvent<ConnectHandler>("connected");
    private _connectMessage?: WsClientConnectMessage;
    private _pingInterval: number;
    private _pingTimer?: NodeJS.Timer;
    get status(){ return this._status }
    get userInfo() { return this._userInfo }
    constructor(socket:WebSocket, options?:{ pingInterval:number }){
        this.socket = socket;
        this._pingInterval = options?options.pingInterval:40000;
        let connectionListener = (data: WebSocket.RawData, isBinary: boolean)=>{
            this._connectionListener(data, isBinary);
            socket.removeListener("message",connectionListener);
        }
        socket.addListener("message", connectionListener);
    }
    private async _connectionListener(data: RawData, isBinary: boolean){
        const jsonRaw = data.toString();
        var authInfo:AuthInfo | null = null;
        try{
            this._connectMessage = new WsClientConnectMessage(JSON.parse(jsonRaw));;
            authInfo = await Auth.tryGetBy(this._connectMessage.token);
        } catch (e){
            if(!(e instanceof InvalidTokenError)) console.error(e);
        }
        if(authInfo) this._acceptConnection(authInfo);
        else this._disconnect();
    }
    private _acceptConnection(authInfo:AuthInfo){
        const message = WsServerConnectResponseMessage.success();
        this.socket.send(message.toJson());
        this.emitter.emit(this.onConnected.name,authInfo);
        this.setStatusAndNotify(WsClientStatus.CONNECTED);
        if(this._pingInterval)
        this._pingTimer = setInterval(()=>this.socket.ping(),this._pingInterval);
    }
    private _disconnect(){
        clearInterval(this._pingTimer);
        this._pingTimer = undefined;
        this.closeWithError(WSCloseCode.authError);
    }
    private setStatusAndNotify(status: WsClientStatus){
        this.emitter.emit(this.changeStatusEvent.name, this._status = status);
    }
    closeWithError(closeCode?:WSCloseCode, message?:string | Buffer | undefined){
        this.socket.close(closeCode?.code, message);
        this.setStatusAndNotify(WsClientStatus.REFUSED_BY_SERVER);
    }
    dispose() {
        this._connectMessage = undefined;
        if(!this.socket.CLOSED && ! this.socket.CLOSING) this.socket.close();
        this.socket.removeAllListeners();
        this.emitter.removeAllListeners();
        this.setStatusAndNotify(WsClientStatus.DISPOSED);
    }
}
export enum WsClientStatus{
    CONNECTED,
    WAIT_FOR_CONNECT,
    REFUSED_BY_SERVER,
    DISPOSED
}