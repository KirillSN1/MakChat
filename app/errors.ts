export default class InvalidArgumentError extends Error{
    constructor(name:string, msg:string = ""){
        super(`Invalid argument "${name}" value. `+msg);
    }
}