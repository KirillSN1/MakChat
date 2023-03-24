import { JsonResponse, RequestData, RouterResponse } from "../../../core/router/Router";
import Auth, { AuthUserCreateError, AuthUserIncorrectPasswordError, AuthUserNotExistsError, InvalidTokenError } from "../../../app/auth/Auth";
import Chat from "../../db/Models/Chat";
import AppUser from "../../db/Models/AppUser";
import ChatParticipant from "../../db/Models/ChatParticipant";
import ChatList from "../../models/ChatList";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";

export default class ApiController{
    /**
     * Параметры запроса:
     *  Обязательные:
     *      token:string - токен авторизации
     *      id:number - id иcкомого пользователя
     */
    public static async createChatWithUser(request:RequestData, response: RouterResponse){
        const id = request.getNumber("id");
        if(!id) return response.error('Не передан обязательный параметр "id"',422);
        const authInfo = AuthMiddleware.getAuthInfo();
        var otherUser = await AppUser.find({ id });
        if(!otherUser) return response.error("Пользователь не найден", 404, "Unknown user id");
        const chat = await Chat.createSingle(`${authInfo.user.name || authInfo.user.login}, ${otherUser.name || otherUser.login}`);
        await ChatParticipant.create({
            appUser: authInfo.user.id,
            chat: chat.id,
            role: 1
        });
        await ChatParticipant.create({
            appUser: otherUser.id,
            chat: chat.id,
            role: 1
        });
        if(!chat) return response.error("Неизвестная ошибка");
        return new JsonResponse(chat);
    }
    /**
     * Параметры запроса:
     *      search:string - универсальный параметр для поиска
     */
    static async findChats(request:RequestData){
        const search = request.getString("search");
        if(!search || !search.length) return new JsonResponse([]);
        const users = await AppUser.findAll({ login:{ operator:"LIKE", value:`%${search}%` } });
        return new JsonResponse(users.filter(u=>u != null).map(u=>u!.safeData));
    }
    static async getUserChats(request:RequestData){
        const authInfo = AuthMiddleware.getAuthInfo();
        const chats = await ChatList.forUser(authInfo.user);
        return new JsonResponse(chats.map(c=>c.serialize()));
    }
}