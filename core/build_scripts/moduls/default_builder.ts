import TsBuilder, { TsBuilderScript } from "../moduls/builder";
/**
 * @param scripts npm скирипты, которые будут запущены во время каждой сборки
 */
export default function getDefaultBuilder(buildScriptName = "build", startScriptName = "start",scripts?:Array<TsBuilderScript>){
    var builder = new TsBuilder(buildScriptName,startScriptName,scripts);
    builder.on("build",()=>console.log("Building..."));
    builder.on("builded",()=>console.log("Build sucsess!"));
    builder.on("appRun",()=>console.log("Running app..."));
    builder.on("appExit",(_,code)=>console.log(`App stopped with code ${code}`));
    return builder;
}