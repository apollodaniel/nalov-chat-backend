import { NextFunction, Request, Response } from "express";
import { User } from "../../types/user";
import { ChatAppDatabase } from "../db";
import { error_map } from "../constants";


export async function register_middleware(req: Request, resp: Response, next: NextFunction){
	try{
		await register_user(new User({...req.body}));

		return resp.sendStatus(204);
	}catch(err: any){
		if(err.message == error_map.username_already_exists.error_msg)
			return resp.status(400).send({errors: [error_map.username_already_exists.error_obj]});
		console.log(err.message);
		return resp.sendStatus(500);
	}
}

async function register_user(user: User){
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(user.toInsert());
}
