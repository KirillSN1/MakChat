import http from "http";
import https from "https";
import Router from '../router/Router';
import Log from '../logs/Log';
import fs from 'fs';
import '../../routes/middleware';
import '../../routes/web';
import '../../routes/api';
import '../../routes/ws';

export default function run(port:number,{ debug = false }:any){
    const privateKey = fs.readFileSync('privatekey.pem' );
    const certificate = fs.readFileSync('certificate.pem' );
    const options = {
        key:privateKey, cert:certificate
    }
    const server = https.createServer(options, (request, response)=>{
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
    return new Promise<http.Server>((resolve)=>server.listen(port, ()=>resolve(server)));
}