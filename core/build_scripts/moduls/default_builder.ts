import nodeNotifier from "node-notifier";
import "colors";
import TsBuilder, { TsBuilderScript } from "../moduls/builder";
/**
 * @param scripts npm скирипты, которые будут запущены во время каждой сборки
 */
export default function getDefaultBuilder(buildScriptName = "build", startScriptName = "start",scripts?:Array<TsBuilderScript>){
    var builder = new TsBuilder(buildScriptName,startScriptName,scripts);
    var lastMessage = { error:false, message:"" };
    builder.on("build",()=>console.log("Building...".yellow));
    builder.on("builded",()=>{
        const message = "Build successful!";
        console.log(message.bgGreen);
        nodeNotifier.notify({ message, title:process.argv.join(" ") });
    });
    builder.on("appRun",()=>console.log("Running app...".yellow));
    // builder.on("error",(_,error)=>console.error(('Error: '+error).red));
    builder.on("error",(_,error)=>{
        let message:string = error?.toString() ?? null;
        const filter = [null,"Debugger attached.","Waiting for the debugger to disconnect..."]
        if(filter.includes(message.trim())) return;
        lastMessage.error = true;
        lastMessage.message = message;
        console.error(`${"Error:".bgRed} ${message.red}`);
    });
    builder.on("data",(data)=>{
        // let message:string = data?.toString() ?? null;
        // // const lastMessagefilter = [null,"Debugger attached.","Waiting for the debugger to disconnect..."]
        // console.log(message.ftrim(lastMessage.message));
    })
    builder.on("appExit",(_,code)=>console.log(`App stopped with code ${code}`.yellow));
    return builder;
}