import MessagesController from "../app/ws/Controllers/MessagesController";
import WebSocketRouter from "../app/ws/WebSocketRouter";
import { BulletType } from "../app/ws/BulletType";

WebSocketRouter.on(BulletType.chat,MessagesController.recirveChatMessage)