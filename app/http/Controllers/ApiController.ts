import { JsonResponse, RequestData, RouterResponse } from "../../../core/router/Router";
import Auth, { AuthUserCreateError, AuthUserIncorrectPasswordError, AuthUserNotExistsError, InvalidTokenError } from "../../../app/auth/Auth";
import Chat from "../../db/Models/Chat";
import AppUser from "../../db/Models/AppUser";
import ChatParticipant from "../../db/Models/ChatParticipant";
import ChatList from "../../models/ChatList";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";
import PropsRule from "../../../low/PropsRule";
import ChatType from "../../db/Models/ChatType";

export default class ApiController{
    public static async createChat(request:RequestData, response: RouterResponse){
        const ids = request.getArray("userIds");
        if(!ids) return response.error('Не передан обязательный параметр "ids"',422);
        const authInfo = AuthMiddleware.getAuthInfo();
        const users = ids.length?await AppUser.query().select("*").where("id",ids):[];
        const chat = await Chat.create(`${authInfo.user.name || authInfo.user.login}, (${users.map(u=>u.name || u.login).join(", ")})`);
        if(!chat) return response.error("Неизвестная ошибка");
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
        return new JsonResponse(chat);
    }
    /**
     * Параметры запроса:
     *      search:string - универсальный параметр для поиска
     */
    static async findChats(request:RequestData){
        const search = request.getString("search");
        const result = { users:[] as any[], chats:[] as any[] };
        if(!search || !search.length) return new JsonResponse(result);
        const foundUsers = await AppUser.findAll({ login:{ operator:"LIKE", value:`%${search}%` } });
        result.users = foundUsers.filter(u=>u != null).map(u=>u!.safeData);
        return new JsonResponse(result);
    }
    static async getUserChats(request:RequestData){
        const authInfo = AuthMiddleware.getAuthInfo();
        const chats = await ChatList.forUser(authInfo.user);
        return new JsonResponse(chats.map(c=>c.serialize()));
    }
}