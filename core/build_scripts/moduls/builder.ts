import { ChildProcess } from "child_process";
import EventEmitter from "events";
import { exec, execScript, execScriptPromice, kill } from "../moduls/exec";

export default class TsBuilder{
    private _arg_scripts;
    private _children:Array<ChildProcess> = [];
    private _rebuildQueue:Array<Function> = [];
    private _building:Boolean = false;
    private _eventor = new EventEmitter();
    private _buildScriptName: string;
    private _startScriftName: string;

    /**
     * @param buildScriptName скрипт сборки
     * @param startScriptName скрипт сборки
     * @param scripts скрипты, которые будут запущены после сборки 
     */
    constructor(buildScriptName:string, startScriptName:string,scripts:Array<TsBuilderScript> = []){
        this._buildScriptName = buildScriptName;
        this._startScriftName = startScriptName;
        this._arg_scripts = scripts;
    }

    private init(children:Array<ChildProcess>){
        this._children = children || [];
        return this;
    }
    kill(){
        var killings = [];
        for(const child of this._children){
            if(!child.pid) continue;
            const killing = kill(child.pid);
            killings.push(killing);
        }
        return Promise.all(killings);
    }
    async build(runBuild:Boolean = true,runStart:Boolean = true){
        if(this._building) await new Promise(resolve=>this._rebuildQueue.unshift(()=>this._build().then(resolve)))
        else await this._build(runBuild,runStart);
    }
    private async _build(runBuild:Boolean = true,runStart:Boolean = true){
        this._building = true;
        await this.kill();
        const children = [];
        if(runBuild){
            const { child:build, code } = await execScriptPromice(this._buildScriptName,{ onSpawn:()=>this._eventor.emit("build") });
            this._eventor.emit("builded", build, code);
            children.push(build);
        }
        if(runStart){
            const start = execScript(this._startScriftName,{
                onSpawn:()=>this._eventor.emit("appRun", start),
                onClose:(code:number)=>this._eventor.emit("appExit", start, code),
                onError:(error:string)=>this._eventor.emit("error", start, error),
                onData:(data:string)=>this._eventor.emit("data", start, data),
            });
            children.push(start);
        }
        this._arg_scripts.forEach(arg_script=>{
            children.push(exec(arg_script.name ,arg_script.command, arg_script.args, arg_script.listeners))
        })
        this._building = false;
        return this.init(children);
    }
    on(eventName: string | symbol, listener: (...args: any[])=>void){
        this._eventor.addListener(eventName,listener);
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void){
        this._eventor.addListener(eventName,listener);
    }
}
export interface TsBuilderScript {
    name:string;
    command:string;
    args:Array<string>;
    listeners?:{ onSpawn?:(...args: any[]) => void, onData?:(...args: any[]) => void, onClose?:(...args: any[]) => void };
}