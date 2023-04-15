import PropsRule from "../../../low/PropsRule";
import { AuthInfo } from "../../auth/Auth";
import ChatMessage from "../../db/Models/ChatMessage";
import ChatParticipant from "../../db/Models/ChatParticipant";
import ChatController from "../../http/Controllers/ChatController";
import WebSocketRouter from "../WebSocketRouter";
import WSClient from "../WsClient/WSClient";
import ChatMessageBullet from "../bullets/ChatMessageBullet";
import WsClientTextMessage from "../punches/WsClientTextMessage";

export default class MessagesController{
    static async recirveChatMessage(data:any,client:WSClient,authInfo:AuthInfo){
        const { id, chatId, text, dateTime } = PropsRule.get(data, 
        { 
            id:Number,
            chatId:{ required:true, type:Number },
            text:{ required:true, type:String },
            dateTime:{ type:Number, required:true }
        });
        const participant = await ChatParticipant.find({ appUser:authInfo.user.id, chat:chatId });
        if(!participant) throw new Error("participant must not be null");
        const message = await ChatMessage.create(participant.id,text,dateTime);
        client.socket.send(new ChatMessageBullet({ 
            id:message.id, 
            userId:authInfo.user.id, 
            status:message.status, 
            text:message.text,
            created_at:message.created_at,
            updated_at:message.updated_at
        }).toJson());
        // ChatController.getChats(authInfo.user);
        // WebSocketRouter.getClient()
        // console.log({ id, chatId, text, dateTime });
    }
}