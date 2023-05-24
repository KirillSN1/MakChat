require('dotenv').config();
export default class Env {
    static readonly APP_TITLE = process.env["APP_TITLE"];
    static readonly DEBUG = process.env["NODE_ENV"] != "production";
    static readonly UNIX_SOCKET = process.env["UNIX_SOCKET"];
    static readonly PORT = Number(process.env["PORT"]);
    static readonly PGHOST = process.env['PGHOST']||"";
    static readonly PGPORT = Number(process.env.PGPORT);
    static readonly logsCatalog = process.env["LOGS"];
    static readonly PGDATABASE = process.env['PGDATABASE'];
    static readonly PGUSER = process.env['PGUSER'] || process.env['USER'];
    static readonly PGPASSWORD = process.env['PGPASSWORD'];
    static readonly loginRegExp = /^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/;
    static readonly AUTH_SECRET = process.env["AUTH_SECRET"]!;
    static readonly AUTH_EXPIRATION = process.env["AUTH_EXPIRATION"]
    static readonly PGLOGGING = process.env["PGLOGGING"];
    static readonly POST_DATA_SIZE_LIMIT = Number(process.env["POST_DATA_SIZE_LIMIT"]);
    static readonly ALLOW_ORIGIN = Env.DEBUG?"*":process.env["ALLOW_ORIGIN"]??""
    static readonly DEFAULT_CHATS_COUNT_LIMIT = Number(process.env["DEFAULT_CHATS_COUNT_LIMIT"]);
}