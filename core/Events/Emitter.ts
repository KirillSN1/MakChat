import EventEmitter from "events";
export default class Emitter extends EventEmitter{
    createEvent<H extends EventHandler>(name:string){
        return new Event<H>(name, this);
    }
}
type EventHandler = {(...args: Array<any>):void};
export class Event<H extends EventHandler>{
    private _emitter: Emitter;
    private _name: string;
    get name(){ return this._name; }
    on(listener: H){
        this._emitter.on(this._name,listener);
    }
    off(listener: H){
        this._emitter.off(this._name,listener);
    }
    removeAllListeners(){ this._emitter.removeAllListeners(this._name); }
    addListener = this.on;
    removeListener = this.off;
    constructor(name:string, emitter:Emitter){ 
        this._name = name
        this._emitter = emitter;
    }
}