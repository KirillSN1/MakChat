import { ChildProcess, spawn } from "child_process";

export function execScript(name:string, { onSpawn, onData, onClose }:any):ChildProcess{ 
    const child = spawn(`npm`, ["run", name],{ shell:true });
    child.on("spawn", onSpawn || (()=>{
        console.log(`Running npm run ${name}...`);
    }));
    child.on('close', onClose || ((code: any) => {
        console.log(`Child process "${name}" exited with code ${code}`);
    }));
    child.stdout.on("data", onData || ((data: { toString: () => any; })=>{
        console.log(data.toString());
    }));
    return child;
}
export function killScript(pId:number | string, haveChildProsesses = false){
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
export function execScriptPromice(name: string, { onSpawn, onData }:any){
    return new Promise<{child:ChildProcess,code:Number}>((resolve)=>{
        var child = execScript(name, { 
            onSpawn, 
            onData, 
            onClose:(code:number)=>resolve({ child ,code })
        });
    });
}