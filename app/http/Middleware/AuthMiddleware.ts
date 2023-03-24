import { RequestData, RouteHandler, RouterResponse } from "../../../core/router/Router";
import Auth, { AuthInfo } from "../../auth/Auth";

export class AuthMiddleware{
    // static get authInfo(){ return this._authInfo }
    static getAuthInfo(){
        if(!this._authInfo) throw new Error("Maybe need to apply AuthMiddleware to this route.");
        return this._authInfo;
    }
    private static _authInfo?:AuthInfo = undefined;
    static async handler(request: RequestData, response:RouterResponse, next:RouteHandler){
        const token = request.getString('token');
        if(!token) return response.error('Не передан обязательный параметр "token"',422);
        const authInfo = await Auth.tryGetBy(token);
        if(!authInfo) return response.error("Неверный токен", 401, "Unauthorized");
        AuthMiddleware._authInfo = authInfo;
        const result = await next(request,response);
        AuthMiddleware._authInfo = undefined;
        return result;
    }
}