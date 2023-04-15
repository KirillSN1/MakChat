import { UserJwt } from "../../auth/Auth";
import DB from "../DB";
import { DBType, DBTypeParser } from "../DBType";
import Model from "../Model";
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
        // this.getKnex.select().then((dd)=>dd[0].)
    }
    private static _find(data:FindData, limit?:number){
        const client = DB.connect();
        var sql = `SELECT * FROM "AppUser" WHERE `;
        sql += Object.entries(data).map(param=>`"${param[0]}" ${DBTypeParser.get(param[1])}`).join(" AND ");
        if(limit != null && limit>0) sql += ` LIMIT ${limit}`;
        return client.query(sql).catch((e)=>{
            console.error(`error in sql: ${sql}`);
            throw e;
        });
    }
    static async find(data:FindData){
        const result = await this._find(data, 1);
        return AppUser.parse(result.rows[0]);
    }
    static async findAll(data:FindData, limit?:number){
        const result = await this._find(data,limit);
        return result.rows.map((raw)=>AppUser.parse(raw));
    }
    static query(){
        return this.getKnex<AppUser>();
    }
}