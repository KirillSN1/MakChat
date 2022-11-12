import Env from "../env";
import Router from "../core/router/Router";

Router.route("GET", "/Api/getPort", ()=>Env.port);