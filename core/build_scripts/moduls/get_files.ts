const findit = require("findit");
var path = require('path');


export default function getFiles(dir: string, { excludeDir, match }: any){
    var finder = findit(dir);
    var files: Array<string> = [];
    finder.on('directory',(dir: string, stat: any, stop: () => void)=>{
        var base = path.basename(dir);
        if(excludeDir.includes(base)) stop();
    });
    finder.on("file", (file: string, start: any)=>{
        if(!match) return files.push(file);
        if(match.test(file)) files.push(file);
    });
    return new Promise<Array<string>>((resolve)=>{
        finder.on('end', ()=>resolve(files));
    });
}