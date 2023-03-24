import Env from "../../../env";
import { exec } from "../moduls/exec";
exec("lt", "lt", ["--port", Env.PORT.toString(), "-s", Env.APP_TITLE]);