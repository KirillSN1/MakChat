import http, { request } from "http";
import Env from "../env";
import Router from './router/Router';
import Log from './logs/Log';
import '../routes/web';
import '../routes/api';
import fs from "fs";

const server = new http.Server((request, response)=>{
    try{ Router.onRequest(request, response); throw new Error("dddS") } 
    catch(e:any){
        const now = new Date();
        Log.append(`errors/${Log.getValidDateStirng(now)}.log`, `${now.toLocaleTimeString()} ${"-".repeat(30)}\n${e.stack}\n`);
        if(Env.DEBUG) console.log(e.stack);
        else console.log(e.message);
        if(response.writable && !response.writableEnded){
            response.writeHead(500,"Server Error", { "Content-Type":"json" });
            if(Env.DEBUG) {
                response.end(`${e.stack}`);
            }
        }
    }
});
server.listen(Env.localPort, ()=>console.log(`Server started on port ${Env.localPort}.`));