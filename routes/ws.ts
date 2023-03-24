import MessagesController from "../app/ws/Controllers/MessagesController";
import WebSocketRouter from "../app/ws/WSClientsHost";
import { WsMessageType } from "../app/ws/WsMessagesTypes";

WebSocketRouter.on(WsMessageType.chat,MessagesController.recirveChatMessage)