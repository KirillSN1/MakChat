import WebSocketRouter from "../app/ws/WSClientsHost";
import Env from "../env";
import run from "./app/run";

async function main(){
    // ChatMessage.create(19,"ksdmksd",123456789)
    const server = await run(Env.PORT,{ debug:Env.DEBUG })
    if(Env.DEBUG) console.log(`Server started: http://${Env.HOST}:${Env.PORT}/.`);
    else console.log(`Server started on port ${Env.PORT}.`);
    WebSocketRouter.init(server);
    console.log(`Web socket started.`);
}
main();