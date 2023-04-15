import DB from "../DB";
import Model from "../Model";

export default class ChatType extends Model{
    id:number = 0;
    title:string = "";
    public static uwu:ChatType = new ChatType({ id:1, title:"uwu"});
    // public static uwu:ChatType = new ChatType({ id:1, title:"uwu"});
    constructor({ id = 0, title = "" }){
        super();
        this.id = id;
        this.title = title;
    }
}