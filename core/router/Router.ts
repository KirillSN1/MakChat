import { IncomingMessage, ServerResponse } from "http";
import url from "url"
import Env from "../../env";
import HEADERS_CONFIG from "./headers_config";

export default class Router {
    private static _routes:Array<Route> = [];
    private static _middlewares: Middleware[] = [];
    static async onRequest(request:IncomingMessage, response:ServerResponse) {
        const route = Router._routes.find((route)=>{
            if(!request.method || !request.url || !route.methodIs(request.method)) return false;
            const incomingUrl = url.parse(request.url || "/");
            if(route.path instanceof RegExp) return route.path.test(incomingUrl.pathname || "");
            else return route.path == incomingUrl.pathname;
        });
        if(route){
            for(const _header of Object.entries(HEADERS_CONFIG))
                response.setHeader(_header[0],_header[1]);
        }
        const next:RouteHandler = async (requestData: RequestData, routerResponse: RouterResponse)=>{
            try{
                var result = await (route?route.handler(requestData,routerResponse):Router.onNotFound(requestData,routerResponse));
                if(response.writable && ! response.writableEnded){
                    if(result != undefined){
                        response.writeHead(200);
                        if(result instanceof JsonResponse) response.write(result.value);
                        else response.write(result.toString());
                    }
                    response.end();
                }
            } catch (e){
                console.error(`Error of route "${route?.path}" in "${route?.handler.name}"`);
                console.error(e);
                if(response.writable && !response.writableEnded) return silantResponseError(response,"Ошибка сервера");
                return;
            }
        }
        const runNextMiddlewareOrRoute = async (requestData: RequestData, routerResponse: RouterResponse,index:number = 0):Promise<any>=>{
            if(!route || route._middlewares.length<=index) return await next(requestData,routerResponse);
            const middlewareName = route._middlewares[index];
            try{
                const middleware = this._middlewares.find(m=>m.name == middlewareName);
                if(!middleware) throw Error("middleware is not defined");
                return await middleware.handler(requestData,routerResponse,async (rd,rr)=>await runNextMiddlewareOrRoute(rd,rr,index+1))
            } catch (e){
                console.error(`Error of middleware "${route?.path}" in "${route?.handler.name}"`);
                console.error(e);
            }
        }
        const requestData = await RequestData.from(request);
        const routerResponse = new RouterResponse(response);
        return await runNextMiddlewareOrRoute(requestData,routerResponse);
    }
	static onNotFound:RouteHandler = (_,response)=>response.error("Not Found",404);
    static route(method:string, path:string | RegExp, handler:RouteHandler){
        const route = new Route(method,path, handler);
        Router._routes.push(route);
        return route;
    }
    static get(path:string | RegExp, handler:RouteHandler){
        return this.route("GET", path,handler);
    }
    static post(path:string | RegExp, handler:RouteHandler){
        return this.route("POST", path,handler);
    }
    static middleware(name:string, handler:RouteMiddlewareHandler){
        return Router._middlewares.push(new Middleware(name,handler));
    }
}
export type RouteHandler = {
    (request:RequestData, response:RouterResponse): any;
};
type RouteMiddlewareHandler = {
    (request:RequestData, response:RouterResponse, next:RouteHandler): any;
};
class Middleware{
    public name:string;
    public handler:RouteMiddlewareHandler;
    constructor(name:string, handler:RouteMiddlewareHandler){
        this.name = name;
        this.handler = handler;
    }
}
class Route{
    protected _method:string;
    protected _path:string | RegExp;
    protected _handler:RouteHandler;
    public _middlewares:string[]=[];
    public get method() : string { return this._method };
    public get path() : string | RegExp { return this._path };
    public get handler() : RouteHandler { return this._handler };
    
    constructor(method:string = "get", path:string | RegExp, handler:RouteHandler){
        this._method = method;
        this._path = path;//TODO:Uri type
        this._handler = handler;
    }
    methodIs(method:string){
        return this._method.toLowerCase() == 'any' || this._method.toLowerCase() == method.toLowerCase();
    }
    middleware(name:string){
        this._middlewares.push(name);
        return this;
    }
}
export class RequestData{
    readonly incomingMessage:IncomingMessage;
    readonly params:URLSearchParams;
    get headers(){ return this.incomingMessage.headers; }
    private constructor(incomingMessage:IncomingMessage, searchData:string = ""){
        this.incomingMessage = incomingMessage;
        if(incomingMessage.method == "GET"){
            const incomingUrl = url.parse(this.incomingMessage.url || "/");
            searchData = incomingUrl.search || "";
        }
        this.params = new URLSearchParams(searchData);
    }
    static async from(incomingMessage:IncomingMessage){
        var data = "";
        if(incomingMessage.method == "POST") data = await this._getData(incomingMessage);
        return new RequestData(incomingMessage,data);
    }
    private static _getData(incomingMessage:IncomingMessage, timeout = 100){
        return new Promise<string>((resolve,reject)=>{
            var body = "";
            var t = setTimeout(()=>reject("read timeout"),timeout);
            incomingMessage.on('end', ()=>{
                clearTimeout(t);
                resolve(body);
            });
            incomingMessage.on("data",(data)=>{
                body+=data;
                if (body.length > Env.POST_DATA_SIZE_LIMIT){
                    incomingMessage.destroy();
                    reject(`Content to large. Limit:${Env.POST_DATA_SIZE_LIMIT}`);
                }
            });
        })
    }
    getString(name:string, defaultValue:string = ""):string{
        return this.params.get(name) || "" || defaultValue;
    }
    getArray<T>(name:string, defaultValue:Array<T> = []):Array<T>{
        return this.getJSON(name,defaultValue);
    }
    getNumber(name:string, defaultValue:string = ""):number{
        return Number(this.getString(name,defaultValue));
    }
    getJSON(name:string, defaultValue:any = null){
        const value = this.params.get(name);
        try{
            return JSON.parse(value!) || (value?(value || defaultValue):defaultValue);
        } catch{
            return value || defaultValue;
        }
    }
}
/**Возвращает пользователю ошибку, при этом не выбрасывая исключений*/
function silantResponseError(response:ServerResponse, message?:any, code:number = 500, status:string = "Server Error", encoding:BufferEncoding = "utf-8"){
    response.statusCode = code;
    response.statusMessage = status;
    response.setHeader('Content-Type', `text/plain; charset=${encoding}`);
    response.end(message);
}
export class RouterResponse{
    readonly native;
    constructor(response:ServerResponse){
        this.native = response;
    }
    /**Возвращает пользователю ошибку, после чего генерирует исключение*/
    error(message?:any, code:number = 500, status:string = "Server Error", encoding:BufferEncoding = "utf-8"){
        silantResponseError(this.native,message,code,status,encoding);
        throw new Error(`response[${code}:${status}]: ${message}.`);
    }
}
export class JsonResponse{
    readonly value;
    constructor(data:Object){
        this.value = JSON.stringify(data);
    }
}