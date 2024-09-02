import { NextFunction, Request, Response } from "express";
import { get_single_user, get_users } from "../functions/users";
import { IUser } from "../../types/user";
import { Auth } from "../../types/auth";
import { JsonWebTokenError } from "jsonwebtoken";


export async function users_get_middleware(req: Request, resp: Response, next: NextFunction){
	try{
		const users = (await get_users()).map((u: IUser) => {
			return {...u, password: undefined}
		});
		return resp.status(200).send({
			users: users
		});
	}catch(err: any){
		console.log(err.message);
		return resp.sendStatus(500);
	}
}


export async function users_get_single_middleware(req: Request, resp: Response, next: NextFunction){
	const user_id = req.params.id!;
	try{
		const user = await get_single_user(user_id);
		return resp.status(200).send({
			...user, password: undefined
		});
	}catch(err: any){
		console.log(err.message);
		return resp.sendStatus(500);
	}
}

export async function get_current_user_middleware(req: Request, resp: Response, next: NextFunction){
	const auth = req.auth;

	try{
		const auth_obj = new Auth({token: Auth.verify_auth_token(auth)});
		const user = await get_single_user(auth_obj.user_id);
		return resp.send({...user, password: undefined});
	}catch(err: any){
		if(err instanceof JsonWebTokenError){
			return resp.sendStatus(401);
		}

		return resp.sendStatus(500);
	}
}
