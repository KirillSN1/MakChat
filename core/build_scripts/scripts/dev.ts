import { TsBuilderScript } from "../moduls/builder";
import getDefaultBuilder from "../moduls/default_builder";
const args = process.argv.slice(2);
const buildArg = "/build";
const startArg = "/start";
const buildArgIndex = args.indexOf(buildArg);
const buildScriptName = buildArgIndex<0?"":args[buildArgIndex+1];
const startArgIndex = args.indexOf(startArg);
const startScriptName = startArgIndex<0?"":args[startArgIndex+1];
const scripts = args.filter(value=>!([buildArg,startArg,buildScriptName,startScriptName].includes(value)));
const builderScripts:Array<TsBuilderScript> = scripts.map(script=>({
    command:"npm", args:["run",script], name:script
}));
const builder = getDefaultBuilder(buildScriptName,startScriptName,builderScripts);
builder.build(buildScriptName.length>0,startScriptName.length>0);