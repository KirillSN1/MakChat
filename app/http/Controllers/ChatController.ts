import { AuthInfo } from "../../auth/Auth";
import AppUser from "../../db/Models/AppUser";
import Chat from "../../db/Models/Chat";
import ChatParticipant from "../../db/Models/ChatParticipant";
import InvalidArgumentError from "../../errors";

export default class ChatController{
    public static async createChat(ids:number[], authInfo:AuthInfo){
        if(!ids) throw new InvalidArgumentError('Не передан обязательный параметр "ids"');
        const users = ids.length?await AppUser.query().select("*").whereIn("id",ids):[];
        const chat = await Chat.create(`${authInfo.user.name || authInfo.user.login}, (${users.map(u=>u.name || u.login).join(", ")})`);
        if(!chat) throw new Error("Неизвестная ошибка");
        await ChatParticipant.create({
            appUser: authInfo.user.id,
            chat: chat.id,
            role: 1
        });
        await Promise.all(
            users.map((user)=>
                ChatParticipant.create({
                    appUser: user.id,
                    chat: chat.id,
                    role: 1
                })
            )
        );
        return chat;
    }
}