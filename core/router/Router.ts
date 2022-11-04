import { IncomingMessage, ServerResponse } from "http";

export default class Router {
    private static _routes:Array<Route> = [];
    static onRequest(request:IncomingMessage, response:ServerResponse) {
        const route = Router._routes.find((route)=>{
            if(!request.method || !request.url || !route.methodIs(request.method)) return false;
            if(route.path instanceof RegExp) return route.path.test(request.url);
            else return route.path == request.url;
        });
        var result = route?route.handler(request,response):Router.onNotFound(request,response);
        if(response.writable){
            if(result){
                response.writeHead(200);
                response.write(result.toString());
            }
            response.end();
        }
    }
	static onNotFound:RouteHandler = (_,response)=>{ response!.writeHead(404); return "Not Found" };
    static route(method:String, path:String | RegExp, handler:RouteHandler){
        Router._routes.push(new Route(method,path, handler));
    }
}
type RouteHandler = {
    (request?:IncomingMessage, response?:ServerResponse): any;
};
class Route{
    protected _method:String;
    protected _path:String | RegExp;
    protected _handler:RouteHandler;
    public get method() : String { return this._method };
    public get path() : String | RegExp { return this._path };
    public get handler() : RouteHandler { return this._handler };
    
    constructor(method:String = "get", path:String | RegExp, handler:RouteHandler){
        this._method = method;
        this._path = path;//TODO:Uri type
        this._handler = handler;
    }
    methodIs(method:String){
        return this._method.toLowerCase() == 'any' || this._method.toLowerCase() == method.toLowerCase();
    }
}