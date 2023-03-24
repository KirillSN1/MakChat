abstract class DBValue<T>{
    value:T|string = "";
    operator:string = "=";
}
export type DBType<T> = T | DBValue<T>
export class DBTypeParser{
    private constructor(){};
    private static isObj<T>(value:DBType<T>):value is DBValue<T>{
        return value != null && typeof value == "object"
            && "value" in value
            && "operator" in value;
    }
    private static getValue<T>(value:DBValue<T>){
        switch(value.operator.trim().toLowerCase()){
            case("in"):case("not in"):return `(${value.value})`;
            case("is null"):case("is not null"):return ``;
            default:return `'${value.value}'`;
        }
    }
    static operator<T>(value:DBType<T>){
        const isObj = this.isObj(value);
        if(!isObj) return `=`;
        return value.operator.trim();
    }
    static get<T>(value:DBType<T>){
        const isObj = this.isObj(value);
        if(!isObj) return `= '${value}'`;
        return `${value.operator.trim()} ${this.getValue(value)}`;
    }
}