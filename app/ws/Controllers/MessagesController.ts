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
    //TODO:!!!!!!!!!!!Разобратьс, какого хрена participant.appUser "не правильный"
    //Если разберусь сдалать sendMessage(from:ChatParticipant, to:ChatParticipant, message:ChatMessage)
    //TODO:возвращать сообщение отправителю прежде всего(перед запросами и прочим говном).
    static async recirveChatMessage(data:any, authInfo:AuthInfo){
        const userId = authInfo.user.id;
        const messageData = PropsRule.get(data, 
        { 
            id:Number,
            chatId:{ required:true, type:Number },
            text:{ required:true, type:String },
            dateTime:{ type:Number, required:true }
        });
        const author = await ChatParticipant.find({ appUser:userId, chat:messageData.chatId });
        if(!author) throw new Error("author must not be null");
        const message = await MessagesController.handleMessage({ ...messageData, from:author });
        MessagesController.sendMessage(author, author,message);
        const participants = await ChatParticipant.findAll({ chat:messageData.chatId });
        for(const participant of participants){
            if(author.id == participant.id) continue;
            MessagesController.sendMessage(author, participant,message);
        }
    }
    static async handleMessage(data:{ id?:number,from:ChatParticipant,chatId:number,text:string,dateTime:number }){
        const { id, from:participant, chatId, text, dateTime } = data;
        var message = await ChatMessage.find({ id });
        const edited = message!=undefined && message.text.trim()!=text.trim();
        message = message ?? await ChatMessage.create(participant.id,text,dateTime);
        if(edited) await ChatMessage.knex.update({ text:text.trim(), updated_at:Date.now() })//TODO:edited flag
        return message;
    }
    static sendMessage(from:ChatParticipant, to:ChatParticipant, message:ChatMessage){
        const client = WebSocketRouter.getClient(to.appUser);
        if(client)
        client.socket.send(new ChatMessageBullet({ 
            id:message.id,
            chatId:from.chat,
            userId:from.appUser,
            status:message.status, 
            text:message.text,
            created_at:message.created_at,
            updated_at:message.updated_at
        }).toJson());
    }
}