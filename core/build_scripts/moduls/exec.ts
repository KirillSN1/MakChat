import { ChildProcess, spawn } from "child_process";
const childProcessDebug = require("child-process-debug");

type ScriptEventListeners = { 
    onSpawn?:(...args: any[]) => void, 
    onData?:(...args: any[]) => void, 
    onClose?:(...args: any[]) => void,
    onError?:(...args:any[]) => void 
};
export function exec(name:string = "", command:string, args:Array<string>, listeners?:ScriptEventListeners):ChildProcess{ 
    const child = childProcessDebug.spawn(command, args,{ shell:true });
    const fullName = `${command} ${args.join(" ")}`;
    child.on("spawn", listeners?.onSpawn || (()=>{
        console.log(`Running ${name || fullName}...`);
    }));
    child.on('close', listeners?.onClose || ((code: any) => {
        console.log(`Child process "${name || fullName}" exited with code ${code}`);
    }));
    child.stdout.on("data", listeners?.onData || ((data: { toString: () => any; })=>{
        console.log(data.toString());
    }));
    // child.stderr.on("data", (error)=>console.error(error.toString()));
    child.stderr.on("data", listeners?.onError || ((error:any)=>{
        console.error(error.toString());
    }));
    return child;
}
export function kill(pId:number | string, haveChildProsesses = false){
    var properties = ["/pid", pId.toString(), '/f', '/t'];
    if(haveChildProsesses) properties.push("/t");
    const killchild = spawn("taskkill", properties);
    return new Promise<ChildProcess>((resolve, reject)=>{
        killchild.on('close', (code)=>{
            ([0,128].includes(code||0))?resolve(killchild):reject(code);
        });
    }).catch((code)=>{
        console.error(`Error: ${code}`);
    });
}
export function execScript(name:string, listeners?:ScriptEventListeners):ChildProcess{
    return exec(name,"npm", ["run",name], listeners);
}
export function execScriptPromice(name: string, { onSpawn, onData }:any){
    return new Promise<{child:ChildProcess,code:Number}>((resolve)=>{
        var child = execScript(name, { 
            onSpawn, 
            onData, 
            onClose:(code:number)=>resolve({ child ,code })
        });
    });
}