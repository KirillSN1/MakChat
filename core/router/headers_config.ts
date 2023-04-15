import Env from "../../env";

//array of global responce headers
abstract class HeadersConfig{ [s:string]:number | string | ReadonlyArray<string> }
const HEADERS_CONFIG:HeadersConfig = {
    "Access-Control-Allow-Origin":Env.ALLOW_ORIGIN
}
export default HEADERS_CONFIG;