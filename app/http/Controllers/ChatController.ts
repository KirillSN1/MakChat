import AppUser from "../../db/Models/AppUser";
import Chat from "../../db/Models/Chat";
import ChatMessage from "../../db/Models/ChatMessage";

export default class ChatController{
    // static async createOrEditMessage(chatId:Number,user:AppUser,message:{ id?:number, text:string, dateTime:number }){
    //     const messageId = message.id??0;
        
    //     const exists = messageId>0 && await ChatMessage.knex.select("*").where("id",messageId);
    //     var chatMessage:ChatMessage;
    //     if(exists) {
    //         await ChatMessage.edit(messageId,message.text, message.dateTime);
    //         chatMessage = await ChatMessage.find({ id:message.id });
    //     }
    //     else chatMessage = await ChatMessage.create(chatId,user.id,message.text,message.dateTime);
    //     return chatMessage;
    // }
 
    static async getChats(user:AppUser){
        var chats = await Chat.findAll({ ownerId:user.id});
        chats.push(...(await Chat.findAll({participantId:user.id})));
        return chats;
    }
}