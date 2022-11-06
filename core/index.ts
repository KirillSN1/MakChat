import { Server } from "ws";
import Env from "../env";
import run from "./app/run";

async function main(){
    const server = await run(Env.port,{ debug:Env.DEBUG })
    console.log(`Server started on port ${Env.port}.`);
    const socket = new Server({ server });
    console.log(`Web socket started.`);
    var connections = 0;
    socket.on("connection",(client, request)=>{
        const index = connections++;
        console.log(`added connection ${index}`); 
        client.on("error", (error)=>{
            console.log(`Error on connection #${index}:`);
            console.error(error); 
        });
        client.on("close", (code, reason)=>{
            console.log(`Connection #${index} closed with code #${code}:`);
            console.error(reason);
        });
        client.on("message", (data, isBinary)=>{
            if(data.toString() == "PING") client.send("PONG");
            console.log(`Message from #${index}:`, data.toString());
        });
        client.on("pong",(data)=>{
            console.log(`Pong from #${index}:`, data);
        });
        client.on("unexpected-response",(request, response)=>{
            console.log(`Unexpected response from #${index}.`);
        });
        client.on("upgrade",(request)=>{
            console.log(`Upgrade on ${index}.`);
        })
    });
}
main();