import { AuthMiddleware } from "../app/http/Middleware/AuthMiddleware";
import Router from "../core/router/Router";

Router.middleware('auth',AuthMiddleware.handler);