import { WebSocket, WebSocketServer } from "ws";
import Env from "../env";
import run from "./app/run";

run(Env.port,{ debug:Env.DEBUG }).then((server)=>{
    console.log(`Server started on port ${Env.port}.`);
});
const socketPort = 8080;
const socket = new WebSocketServer({port:socketPort, handleProtocols:(protocols: Set<string>, request): string | false=>{ console.log(protocols); return ""; } },()=>{
    console.log(`Web socket server opened on ${socketPort}`);
    var connections = 0;
    socket.addListener("connection",(client, request)=>{
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
});