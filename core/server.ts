import http from "http";
import Env from "../env";
import Router from './router/Router';
import Log from './logs/Log';
import './../routes/web.ts';
import './../routes/api.ts';

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
if(Env.DEBUG){
    server.listen(Env.localPort, Env.localhost);
    console.log(`Local server started on http://${Env.localhost}:${Env.localPort}.`);
}