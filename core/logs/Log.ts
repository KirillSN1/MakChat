import Env from "../../env";
import fs from "fs";
import { resolve } from "path";

export default class Log{
    static appendSync(path:string, data:string | Uint8Array){
        const regexp = /[^\/]*$/;
        const catalog = (path[0]=="/"?"":"/")+path.replace(regexp, "").substring(0,'/;ldml;d/'.length-1);
        const fileName = regexp.exec(path);
        fs.mkdirSync(Env.logsCatalog+catalog, { recursive:true });
        return fs.appendFileSync(Env.logsCatalog+catalog+fileName, data, "utf8");
    }
    static append(path:string, data:string | Uint8Array){
        return new Promise(()=>{
            this.appendSync(path,data);
            resolve();
        });
    }
    static getValidDateStirng(date:Date = new Date()){
        const datePartsList = Intl.DateTimeFormat().formatToParts(date);
        const dateParts = Object.fromEntries(datePartsList.map(part=>[part.type, part.value]));
        return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    }
}