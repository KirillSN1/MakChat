export default class WSCloseCode{
    static readonly authError = new WSCloseCode(4001);
    static readonly argumentsError = new WSCloseCode(4100);
    
    readonly code:number;
    private constructor(code:number){
        this.code = code;
    }
}