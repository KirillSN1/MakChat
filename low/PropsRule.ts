export default class PropsRule{
    static get<D extends Options>(data:any,options:D) {
        type RequiredType<T,V> = V extends true?T:T|undefined;
        type ArrayToUnion<T extends Constructor[]> = { [K in keyof T]:ToType<T[K]> };
        type UnionFromTuple<T> = T extends (infer U)[] ? U : never;
        type R = {
            [K in keyof D]:D[K] extends PropOptions?
                D[K]['type'] extends Constructor[]?UnionFromTuple<ArrayToUnion<D[K]['type']>>:
                    RequiredType<ToType<D[K]['type']>, D[K]['required']>
            :D[K] extends Constructor[]? UnionFromTuple<ArrayToUnion<D[K]>>:
                RequiredType<ToType<D[K]>,false>
        };
        if(!data) return {} as R;
        const props = Object.entries(options);
        var result = new Map<string,any>();
        for(var prop of props){
            const key = prop[0];
            var opt = prop[1];
            if(!('type' in opt)) opt = { type:opt };
            const value = opt.name?data[opt.name]??undefined:data[key];
            if(opt.required && !key) throw new Error(`Prop "${key}" is required.`);
            const typeIsTrue = (value==null || value==undefined)?!opt.required:
                (Array.isArray(opt.type)?opt.type.includes(value.constructor):value.constructor == opt.type);
            if(!typeIsTrue){
                const errType = Array.isArray(opt.type)?opt.type.map(t=>t.name).join(" | "):opt.type.name;
                if(value == null || value == undefined) throw new TypeError(`Invalid value "${value}" of prop "${key}". (${errType}) expected.`);
                else throw new TypeError(`Invalid type ${value.constructor.name} of prop "${key}". (${errType}) expected.`);
            }
            result.set(key,value);
        }
        return Object.fromEntries(result) as R;
    }
}
type Class = new (...args:any)=>any;
type FunctionConstructor = (...args: any) => any
type Constructor = Class | FunctionConstructor;
type PropType = Constructor | Constructor[];
type PropOptions = { name?:string; required?:boolean; type:PropType };
abstract class Options{
    [s: string]: PropOptions | PropType;
}
type ToType<T> = T extends FunctionConstructor?ReturnType<T>:T extends Class?InstanceType<T>:T;