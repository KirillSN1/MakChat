import { Serialize, SerializeProperty } from "ts-serializer";
import Model from "../Model";
import ChatParticipant from "../Models/ChatParticipant";

@Serialize({})
export default class ChatHistoryMessage extends Model{
    @SerializeProperty() readonly id:number = 0;
    @SerializeProperty() readonly participantId:number = 0;
    @SerializeProperty() readonly text:string = "";
    @SerializeProperty() created_at:number = 0;
    @SerializeProperty() updated_at:number = 0;
    @SerializeProperty() readonly status:number = 0;
    @SerializeProperty() readonly chatId:number = 0;
    @SerializeProperty() readonly appUser:number = 0;
    static getHistory(chatId:Number){
        return ChatHistoryMessage.query().whereIn("participantId", ChatParticipant.query.select("id").where("chat",chatId))
    }
    static query(){
        return this.getKnex<ChatHistoryMessage>();
    }
}