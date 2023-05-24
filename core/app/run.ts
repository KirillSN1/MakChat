import http from "http";
import Router from '../router/Router';
import Log from '../logs/Log';
import '../../routes/middleware';
import '../../routes/web';
import '../../routes/api';
import '../../routes/ws';
import Env from "../../env";
import fs from "fs";

export default function run(port:number,{ debug = false }:any){
    const server = http.createServer((request, response)=>{
        try{ Router.onRequest(request, response) } 
        catch(e:any){
            const now = new Date();
            Log.append(`errors/${Log.getValidDateStirng(now)}.log`, `${now.toLocaleTimeString()} ${"-".repeat(30)}\n${e.stack}\n`);
            console.log(debug?e.stack:e.message);
            if(response.writable && !response.writableEnded){
                response.writeHead(500,"Server Error", { "Content-Type":"text/json" });
                if(debug) response.end(`${e.stack}`);
            }
        }
    })
    return new Promise<http.Server>((resolve)=>{
        if(Env.DEBUG) server.listen(port, ()=>resolve(server));
        else{
            //Unix сокет нужен для связи с сервером nginx
            if(!Env.UNIX_SOCKET) 
                throw new Error(`Env variable "UNIX_SOCKET" is not specified. (File path)`);
            if(!fs.existsSync(Env.UNIX_SOCKET)) 
                throw new Error(`Can not find unix socket file. Please create it.\nPath:${Env.UNIX_SOCKET}.\nOr edit env variable`);
            server.listen(Env.UNIX_SOCKET,()=>resolve(server))
            console.log(`Server is listening on ${Env.UNIX_SOCKET}`);
        }
    });
}