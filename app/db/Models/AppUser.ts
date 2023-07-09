import { UserJwt } from "../../auth/Auth";
import DB from "../DB";
import { DBType, DBTypeParser } from "../DBType";
import Model from "../Model";
import ChatParticipant from "./ChatParticipant";
import { AlreadyExistsError } from "./ModelsError";

class InvalidDataError extends Error{}
type FindData = { id?:DBType<number>, login?:DBType<string>, password?:DBType<string> };
export default class AppUser extends Model{
    readonly id:number = 0;
    readonly login:string = "";
    readonly password:string = "";
    ///Псевдоним
    readonly name:string = "";
    constructor({ id = 0, login = "", password = "" }){
        super();
        if(id == 0 || !login || !password) throw new InvalidDataError("Invalid data.");
        this.id = id;
        this.login = login;
        this.password = password;
    }
    static parse(data?:{ id?:number, login?:string, password?:string }){
        if(!data || !data.id || !data.login || !data.password) return null;
        return new AppUser(data);
    }
    get safeData(){
        return AppUser.safeData(this);
    }
    static safeData(data:AppUser){
        return {
            id:data?.id || 0,
            login:data?.login || ""
        };
    }
    /**
     * 
     * @param login 
     * @param password 
     * @returns 
     * @throws {@link AlreadyExistsError } В случае, если пользователь  с таким логином уже существует
     */
    static async create(login:string, password:string){
        const client = DB.connect();
        if(await this.find({ login })) throw new AlreadyExistsError("User with this login already exists!");
        await client.query(`INSERT INTO "AppUser" ("login","password") VALUES ('${login}', '${password}');`);
        return this.find({ login, password });
    }
    static async find(where:FindData){
        const result = await AppUser.query().select('*').where(where).first();
        if(result) return new AppUser(result);
        return null;
    }
    static async findAll(where:FindData, limit?:number){
        const result = await AppUser.query().select('*').where(where).limit(limit || Number.MAX_SAFE_INTEGER);
        return result.map((raw)=>new AppUser(raw));
    }
    /** Ищет пользователей, у которых нет личного чата с пользователем */
    static findFreeUsers(userId:Number){
        return AppUser.query().select()
            .where("id","NOT IN", ChatParticipant.query.select().distinct("appUser").join("Chat","Chat.id","chat").where("Chat.type",1)
                .whereIn("chat", ChatParticipant.query.select().distinct("chat").where("appUser",userId))
            );
    }
    static query(){
        return this.getKnex<AppUser>();
    }
}