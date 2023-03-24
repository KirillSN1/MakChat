import AppUser from '../db/Models/AppUser';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import Env from '../../env';

export default class Auth {
    static async signUp(login:string, password:string){
        const hashedPassword = await argon2.hash(password);
        const user = await AppUser.create(login,hashedPassword);
        if(!user) throw new AuthUserCreateError();
        return new AuthInfo(user, UserJwt.encode(user));
    }
    static async signIn(login:string, password:string){
        const user = await AppUser.find({ login });
        if(!user) throw new AuthUserNotExistsError();
        const passIsCorect = await argon2.verify(user.password, password);
        if(!passIsCorect) throw new AuthUserIncorrectPasswordError();
        return new AuthInfo(user,UserJwt.encode(user));
    }
    static async signedIn(token:string){
        if(!UserJwt.verify(token)) throw new InvalidTokenError();
        const data = UserJwt.decode(token);
        if(!data.id || !data.login) throw new InvalidTokenError();
        const user = await AppUser.find({ id:data.id });
        if(!user) throw new AuthUserNotExistsError();
        return new AuthInfo(user, token);
    }
    static async tryGetBy(token:string){
        try{ return this.getBy(token); }
        catch{ return null }
    }
    static async getBy(token:string){
        const { data } = await UserJwt.verify(token) as { data:any };
        // console.log({ tokenIsCorect });
        if(!data) throw new InvalidTokenError();
        // const data = UserJwt.decode(token);
        const user = await AppUser.find({ id:data.id });
        if(!user) throw new AuthUserNotExistsError();
        return new AuthInfo(user, token);
    }
}
export class UserJwt{
    static encode(user:AppUser):string{
        return jwt.sign({ data:user.safeData }, Env.AUTH_SECRET, { expiresIn: Env.AUTH_EXPIRATION });
    }
    static test(user:AppUser){
        const s = jwt.sign({ data:user.safeData }, Env.AUTH_SECRET, { expiresIn: Env.AUTH_EXPIRATION });
        return {
            s,
            v:this.verify(s)
        }
    }
    static decode(token:string){
        const decoded = jwt.decode(token) as { data:any };
        return AppUser.safeData(decoded?.data);
    }
    static verify(token:string){
        return jwt.verify(token,Env.AUTH_SECRET);
    }
}
export class AuthInfo{
    readonly user:AppUser;
    readonly token:string;
    constructor(user:AppUser, token:string){
        this.user = user;
        this.token = token;
    }
}
export class AuthUserNotExistsError extends Error{}
export class AuthUserIncorrectPasswordError extends Error{}
export class AuthUserCreateError extends Error{}
export class InvalidTokenError extends Error{}