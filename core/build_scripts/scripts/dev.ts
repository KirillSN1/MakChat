import TsBuilder from "../moduls/builder";

export default function devbuild(){
    var builder = new TsBuilder();
    builder.on("build",()=>console.log("Building..."));
    builder.on("builded",()=>console.log("Build sucsess!"));
    builder.on("appRun",()=>console.log("Running app..."));
    builder.on("appExit",(_,code)=>console.log(`App stopped with code ${code}`));
    builder.build();
    return builder;
}
if(process.argv.slice(2).includes("--build")) devbuild();