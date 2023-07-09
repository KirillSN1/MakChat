import { JsonResponse, RequestData, RouterResponse } from "../../../core/router/Router";
import AppUser from "../../db/Models/AppUser";
import ChatList from "../../models/ChatList";
import { AuthMiddleware } from "../Middleware/AuthMiddleware";
import ChatController from "./ChatController";
import WebSocketRouter from "../../ws/WebSocketRouter";
import ChatListBullet, { ChatListEventType } from "../../ws/bullets/ChatListBullet";
import ChatListItem from "../../models/ChatListItem";
import ChatParticipant from "../../db/Models/ChatParticipant";
import { ChatMessageBulletData } from "../../ws/bullets/ChatMessageBullet";
import ChatHistoryMessage from "../../db/Views/ChatHistoryMessage";

export default class ApiController{
    public static async createChat(request:RequestData, response: RouterResponse){
        const ids = request.getArray("userIds")?.map(id=>Number(id));
        if(!ids) return response.error('Не передан обязательный параметр "ids"',422);
        const authInfo = AuthMiddleware.getAuthInfo();
        try{
            const chat = await ChatController.createChat(ids,authInfo);
            const participants = await ChatParticipant.of(chat.id);
            for(const participant of participants){
                const client = WebSocketRouter.getClient(participant.appUser);
                if(!client) continue;
                const userChat = await chat.for(client.authInfo?.user);
                const chatListItem = await ChatListItem.from(userChat, participant);
                client.socket.send(new ChatListBullet({ chats:[chatListItem], type:ChatListEventType.add }).toJson());
            }
            return new JsonResponse(chat);
        } catch(e){
            console.error(e);
            return response.error(e instanceof Error?e.message:e);
        }
    }
    /**
     * Параметры запроса:
     *      search:string - универсальный параметр для поиска
     */
    static async findChats(request:RequestData){
        const authInfo = AuthMiddleware.getAuthInfo();
        const search = request.getString("search");
        const result = { users:[] as any[], chats:[] as any[] };
        if(!search || !search.length) return new JsonResponse(result);
        const foundUsers = await AppUser.findFreeUsers(authInfo.user.id).where("login", "LIKE", `%${search}%`);//TODO:Поиск групповых чатов впридачу к тем, что уже есть
        result.users = foundUsers.filter(u=>u).map(u=>new AppUser(u).safeData);
        return new JsonResponse(result);
    }
    static async getUserChats(request:RequestData){
        const authInfo = AuthMiddleware.getAuthInfo();
        const chats = await ChatList.forUser(authInfo.user);
        return new JsonResponse(chats.map(c=>c.serialize()));
    }
    static async getMessagesHystory(request:RequestData, response: RouterResponse){
        const chatId = request.getNumber("chatId");
        if(Number.isNaN(chatId) || !chatId) return response.error('Неверное значение параметра "chatId"',422);
        const authInfo = AuthMiddleware.getAuthInfo();
        const participant = await ChatParticipant.for(chatId,authInfo.user.id).select("id");
        if(!participant) return response.error(`Пользователь #${authInfo.user.id} не состоит в чате #${chatId}!`,422);
        const messages = await ChatHistoryMessage.getHistory(chatId);
        return new JsonResponse(messages.map((m)=>ChatMessageBulletData.from(m)));
    }
}