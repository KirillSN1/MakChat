import Router from "../core/router/Router";

Router.onNotFound = ()=>"Not Found";
Router.route("get", "/", ()=>"Hello world");