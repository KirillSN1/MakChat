import { ChildProcess } from "child_process";
import EventEmitter from "events";
import { execScript, execScriptPromice, killScript } from "../moduls/exec";

export default class TsBuilder{
    private _children:Array<ChildProcess> = [];
    private _rebuildQueue:Array<Function> = [];
    private _building:Boolean = false;
    private _eventor = new EventEmitter();
    private init(children:Array<ChildProcess>){
        this._children = children || [];
        return this;
    }
    kill(){
        var killings = [];
        for(const child of this._children){
            if(!child.pid) continue;
            const killing = killScript(child.pid);
            killings.push(killing);
        }
        return Promise.all(killings);
    }
    async build(){
        if(this._building) await new Promise(resolve=>this._rebuildQueue.unshift(()=>this._build().then(resolve)))
        else await this._build();
    }
    private async _build(){
        this._building = true;
        await this.kill();
        const { child:build, code } = await execScriptPromice("build",{ onSpawn:()=>this._eventor.emit("build") });
        this._eventor.emit("builded", build, code);
        const start = execScript("start",{
            onSpawn:()=>this._eventor.emit("appRun", start),
            onClose:(code:number)=>this._eventor.emit("appExit", start, code)
        });
        this._building = false;
        return this.init([build,start]);
    }
    on(eventName: string | symbol, listener: (...args: any[])=>void){
        this._eventor.addListener(eventName,listener);
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void){
        this._eventor.addListener(eventName,listener);
    }
}