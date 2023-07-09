import { Serializable } from "ts-serializer";
import AppUser from "../db/Models/AppUser";
import ChatListItem from "./ChatListItem";
import Chat from "../db/Models/Chat";
import ChatParticipant from "../db/Models/ChatParticipant";

export default class ChatList extends Serializable {
    static async *generateForUser(user:AppUser){
        const chatsParticipantsOfUser = await ChatParticipant.findAll({ appUser:user.id });
        const chatIds = chatsParticipantsOfUser.map(p=>p.chat);
        if(chatIds.length){
            const chats = await Chat.query().select("*").whereIn("id",chatIds);
            for(const participantOfUser of chatsParticipantsOfUser){
                var chat = chats.find(c=>c.id == participantOfUser.chat);
                if(!chat) continue;
                chat = await Chat.for(chats.find(c=>c.id == participantOfUser.chat), user);
                yield await ChatListItem.from(chat,participantOfUser);
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