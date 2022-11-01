import http, { ServerResponse, ClientRequest, IncomingMessage } from 'http'
import Env from "../env";
import Router from './router/Router';
import './../routes/web.ts';
import './../routes/api.ts';

const args = process.argv.slice(2);
const local = args.includes("--local");
const server = new http.Server(Router.onRequest);
if(local){ 
    server.listen(Env.localPort, Env.localhost);
    console.log(`Local server started on http://${Env.localhost}:${Env.localPort}.`);
}
