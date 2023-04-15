import { BulletType } from "../BulletType";

export default class ConnectPunch{
    public readonly token:string;
    constructor(data:{ token:string }){
        this.token = data.token;
    }
}