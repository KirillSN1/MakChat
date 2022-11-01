import { hostname as getHostname } from "os";
import http, { ServerResponse, ClientRequest, IncomingMessage } from 'http'
import https from 'https';
import fs from "fs";

const options = {
  key: fs.readFileSync('./server/key.pem'),
  cert: fs.readFileSync('./server/cert.pem')
};

const hostname = getHostname();
const keyword = "MouseShareHost"
https.createServer(options,onRequest).listen(8888, hostname);
function onRequest(request:IncomingMessage, response:ServerResponse) {
    switch(request.url){
        case "/":{
            console.log(`request`);
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(keyword);
            response.end();
        } break;
        default: {
            response.writeHead(404);
            response.end();
        }
    }
}