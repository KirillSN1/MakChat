import Env from "../env";
import ApiController from "../app/http/Controllers/ApiController";
import Router, { JsonResponse } from "../core/router/Router";
import AuthController from "../app/http/Controllers/AuthController";

Router.get("/Api/signUp", AuthController.signUp);
Router.get("/Api/signIn", AuthController.signIn);
Router.get("/Api/testLogin", (request)=>new JsonResponse({
    result:Env.loginRegExp.test(request.getString("login")) 
}));
Router.get("/Api/findChats", ApiController.findChats);
Router.get("/Api/getUserChats",ApiController.getUserChats).middleware('auth');
Router.post("/Api/createChat", ApiController.createChat).middleware('auth');