import { NextFunction, Request, Response } from "express";
import { get_single_user, get_users } from "../functions/users";
import { IUser, User } from "../../types/user";
import { Auth } from "../../types/auth";
import { JsonWebTokenError } from "jsonwebtoken";
import { ChatAppDatabase } from "../db";


export async function users_get_middleware(req: Request, resp: Response, next: NextFunction){
	try{

		const current_user_id = (new Auth({token: Auth.verify_auth_token(req.auth!)})).user_id;
		const users = (await get_users()).filter((u: IUser )=>
			current_user_id != u.id!
		).map((u: IUser) => {
			return {...u, password: undefined}
		});
		return resp.status(200).send(users);
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
		if(err.message == "not found")
			return resp.sendStatus(404);
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

export async function users_patch_single_middleware(req: Request, resp: Response, next: NextFunction){
	const auth = req.auth;

	try{
		const auth_obj = new Auth({token: Auth.verify_auth_token(auth)});

		console.log(req.body);

		if(req.query.name){
			const db = ChatAppDatabase.getInstance();
			await db.exec_db(User.toPatch(auth_obj.user_id, {name: req.body.name as string}));
		}

		next();
	}catch(err: any){
		console.log(err.message);
		if(err instanceof JsonWebTokenError){
			return resp.sendStatus(401);
		}

		return resp.sendStatus(500);
	}
}
