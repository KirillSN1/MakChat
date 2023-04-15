import { Serializable } from "ts-serializer";
import AppUser from "../db/Models/AppUser";
import ChatListItem from "./ChatListItem";
import Chat from "../db/Models/Chat";
import ChatParticipant from "../db/Models/ChatParticipant";
import ChatMessage from "../db/Models/ChatMessage";

export default class ChatList extends Serializable {
    static async *generateForUser(user:AppUser){
        const chatsParticipantsOfUser = await ChatParticipant.findAll({ appUser:user.id });
        const chatIds = chatsParticipantsOfUser.map(p=>p.chat);
        if(chatIds.length){
            const chats = await Chat.query().select("*").whereIn("id",chatIds);
            for(const participantOfUser of chatsParticipantsOfUser){
                const chat = chats.find(c=>c.id == participantOfUser.chat);
                if(!chat) continue;
                var chatName = chat.name;
                // if(chat.participantId){//если participantId не нулевой, значит чат личный и необходимо найти запись собеседника.
                //     const participantId = chat.participantId==user.id?chat.ownerId:chat.participantId;
                //     const participant = await ChatParticipant.find({ id:participantId });
                //     chatName = (await AppUser.find({id:participant!.appUser}))!.name;
                // }
                const messagesCount = await ChatMessage.count({ 
                    participantId:participantOfUser.id,
                    id:{ operator:">", value:participantOfUser.lastReadedMessageId }
                });
                const lastMessage = await ChatMessage.findLast({ id:0 });//TODO:lastmessage
                yield new ChatListItem(chat.id,chatName, chat.type,messagesCount,lastMessage);
            }
        }
    }
    static async forUser(user:AppUser){
        const chatListGenerator = this.generateForUser(user);
        const result:ChatListItem[] = [];
        for await (const message of chatListGenerator){
            result.push(message);
        }
        return result;
    }
}