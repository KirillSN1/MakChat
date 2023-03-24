import { watchFile } from "fs";
import {TsBuilderScript} from "../moduls/builder";
import getFiles from "../moduls/get_files";
import getDefaultBuilder from "../moduls/default_builder";

const excludeDir = ["node_modules", "dist", "storage", "public", "build_scripts"];
const match = /\.ts$/;
const args = process.argv.slice(2);
const buildArg = "/build";
const startArg = "/start";
const buildArgIndex = args.indexOf(buildArg);
const buildScriptName = buildArgIndex<0?"":args[buildArgIndex+1];
const startArgIndex = args.indexOf(startArg);
const startScriptName = startArgIndex<0?"":args[startArgIndex+1];
const scriptNames = args.filter(value=>!([buildArg,startArg,buildScriptName,startScriptName].includes(value)));
const builderScripts = scriptNames.map(name=>({ command:"npm", args:["run",name], name } as TsBuilderScript));
const builder = getDefaultBuilder(buildScriptName,startScriptName,builderScripts);
const build = ()=>builder.build(Boolean(buildScriptName),Boolean(startScriptName));
getFiles("./",{ excludeDir, match}).then((files)=>{
    build();
    files.forEach(file=>watchFile(file,{ persistent:true }, ()=>build()));
});