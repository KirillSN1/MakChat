export default class Env {
    static readonly APP_TITLE = "makchat1";
    static readonly DEBUG = process.env["NODE_ENV"] != "production";
    static readonly PORT = Number(process.env.PORT) || 5000;
    static readonly HOST = Env.DEBUG?"localhost":process.env['PGHOST'];
    static readonly PGPORT = Number(process.env.PGPORT) || 5432;
    static readonly logsCatalog = "./storage/logs";
    static readonly PGDATABASE = Env.DEBUG?"makchat":process.env['PGDATABASE'];
    static readonly PGUSER = Env.DEBUG?"root":process.env['USER'];
    static readonly PGPASSWORD = Env.DEBUG?"root":process.env['PGPASSWORD'];
    static readonly loginRegExp = /^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/;
    static readonly AUTH_SECRET = "HD2dJPBdssjk3JHsbgl7kP3djk6wafdaW3fNCi96"
    static readonly AUTH_EXPIRATION = "24h"
    static readonly PG_LOGGING = false;
    static readonly SYNC_DATABASE_ON_BUILD = true;
    static readonly postDataSizeLimit = 1e6;
}