import WebSocket, { RawData } from "ws";
import Emitter, { Event } from "../../../core/Events/Emitter";
import Auth, { AuthInfo, InvalidTokenError } from "../../auth/Auth";
import InvalidArgumentError from "../../errors";
import ConnectPunch from "../punches/ConnectPunch";
import ConnectionBullet from "../bullets/ConnectionBullet";
import WSCloseCode from "../WSCloseCodes";

type ChangeStatusHandler = { (status:WsClientStatus):void }
type ConnectHandler = { (authInfo:AuthInfo):void }
export default class WSClient {
    readonly socket: WebSocket;
    private readonly emitter = new Emitter();
    private _status: WsClientStatus = WsClientStatus.WAIT_FOR_CONNECT;
    private _authInfo: AuthInfo | null = null;
    private _connectMessage?: ConnectPunch;
    private _pingInterval: number;
    private _pingTimer?: NodeJS.Timer;
    get status(){ return this._status }
    get authInfo() { return this._authInfo }
    public readonly changeStatusEvent = this.emitter.createEvent<ChangeStatusHandler>("changeStatus");
    public readonly onConnected = this.emitter.createEvent<ConnectHandler>("connected");
    
    constructor(socket:WebSocket, options?:{ pingInterval:number }){
        this.socket = socket;
        this._pingInterval = options?options.pingInterval:40000;
        socket.once("message", (data: WebSocket.RawData, isBinary: boolean)=>
            this._connectionListener(data, isBinary));
        socket.once('close',()=>this._onCloseSocket());
    }
    private async _connectionListener(data: RawData, isBinary: boolean){
        const jsonRaw = data.toString();
        var authInfo:AuthInfo | null = null;
        try{
            this._connectMessage = new ConnectPunch(JSON.parse(jsonRaw));;
            authInfo = await Auth.tryGetBy(this._connectMessage.token);
        } catch (e){
            if(!(e instanceof InvalidTokenError)) console.error(e);
        }
        if(authInfo) this._acceptConnection(authInfo);
        else this._rejectConnection();
    }
    private _acceptConnection(authInfo:AuthInfo){
        const message = ConnectionBullet.success(authInfo.user.id);
        this.socket.send(message.toJson());
        this.emitter.emit(this.onConnected.name, this._authInfo = authInfo);
        this.setStatusAndNotify(WsClientStatus.CONNECTED);
        if(this._pingInterval)
        this._pingTimer = setInterval(()=>this.socket.ping(),this._pingInterval);
    }
    private _rejectConnection(){
        this._disconnect();
        this.closeWithError(WSCloseCode.authError);
    }
    private _onCloseSocket(){
        this._disconnect();
        this.setStatusAndNotify(WsClientStatus.REJECTED_BY_CLIENT);
    }
    private _disconnect(){
        clearInterval(this._pingTimer);
        this._pingTimer = undefined;
    }
    private setStatusAndNotify(status: WsClientStatus){
        this.emitter.emit(this.changeStatusEvent.name, this._status = status);
    }
    closeWithError(closeCode?:WSCloseCode, message?:string | Buffer | undefined, status?:WsClientStatus){
        this.socket.close(closeCode?.code, message);
        this.setStatusAndNotify(status ?? WsClientStatus.REJECTED_BY_SERVER);
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
    REJECTED_BY_SERVER,
    REJECTED_BY_CLIENT,
    DISPOSED
}