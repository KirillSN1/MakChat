import { DatabaseError } from "pg";
import { JsonResponse, RequestData, RouterResponse } from "../../../core/router/Router";
import Env from "../../../env";
import Auth, { AuthUserCreateError, AuthUserIncorrectPasswordError, AuthUserNotExistsError, InvalidTokenError, UserJwt } from "../../auth/Auth";
import { AlreadyExistsError } from "../../db/Models/ModelsError";
import { TokenExpiredError } from "jsonwebtoken";

export default class AuthController{
    static async signUp(request:RequestData, response:RouterResponse) {
        const login = request.getString("login");
        if(!Env.loginRegExp.test(login)) return response.error("Неверный формат логина", 422, "Format error.");
        const password = request.getString("password");
        if(!login) return response.error("url parameter expected: login", 400, "Params error.");
        if(!password) return response.error("url parameter expected: password", 400, "Params error.");
        try{
            const authInfo = await Auth.signUp(login,password);
            return new JsonResponse({ ...authInfo.user.safeData, token:authInfo.token });
        } catch (e) {
            if(e instanceof AlreadyExistsError) return response.error("Пользователь уже сущетвует.", 409, "Already exists.");
            if(e instanceof AuthUserCreateError) return response.error("Ошибка создания пользователя", 500);
            throw e;
        }
    }
    static async signIn(request:RequestData, response:RouterResponse){
        const login = request.getString("login");
        const password = request.getString("password");
        const tokenParam = "token";
        const token = request.getString(tokenParam, request.headers.authorization);
        if(!token){
            if(!login && !password) return response.error("url parameter expected: token", 400, "Params error.");
            if(!login) return response.error("url parameter expected: login", 400, "Params error.");
            if(!password) return response.error("url parameter expected: password", 400, "Params error.");
            try{
                const authInfo = await Auth.signIn(login,password);
                return new JsonResponse({ ...authInfo.user.safeData, token:authInfo.token });
            } catch (e) {
                if(e instanceof AuthUserNotExistsError) return response.error("Пользователя не сущетвует.", 409, "Not found.");
                if(e instanceof AuthUserIncorrectPasswordError) return response.error("Пароль неверный.", 401, "Incorrect password");
                else throw e;
            }
        }
        try{
            const authInfo = await Auth.signedIn(token);
            return new JsonResponse({ ...authInfo.user.safeData, token:authInfo.token });
        } catch(e){
            if(e instanceof InvalidTokenError) return response.error("Неверный токен", 401, "Incorrect token");
            else if(e instanceof TokenExpiredError) return response.error("Токен просрочен", 401, "Token expired");
            else if(e instanceof Error) return response.error(e.message, 401, e.name);
            else return response.error("Неизвестная ошибка", 401);
        }
    }
}