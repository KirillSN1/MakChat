"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("../../env"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
class Log {
    static appendSync(path, data) {
        const regexp = /[^\/]*$/;
        const catalog = (path[0] == "/" ? "" : "/") + path.replace(regexp, "").substring(0, '/;ldml;d/'.length - 1);
        const fileName = regexp.exec(path);
        fs_1.default.mkdirSync(env_1.default.logsCatalog + catalog, { recursive: true });
        return fs_1.default.appendFileSync(env_1.default.logsCatalog + catalog + fileName, data, "utf8");
    }
    static append(path, data) {
        return new Promise(() => {
            this.appendSync(path, data);
            (0, path_1.resolve)();
        });
    }
    static getValidDateStirng(date = new Date()) {
        const datePartsList = Intl.DateTimeFormat().formatToParts(date);
        const dateParts = Object.fromEntries(datePartsList.map(part => [part.type, part.value]));
        return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    }
}
exports.default = Log;
