import { NextFunction, Request, Response } from "express";
import { UserCredentials } from "../../types/types";
import { check_user_credential_valid } from "../functions";
import { Auth } from "../../types/auth";
import { ChatAppDatabase } from "../db";
import { error_map } from "../constants";



export async function login_middleware(req: Request, resp: Response, next: NextFunction) {
	const user_credential: UserCredentials = req.body;
	const db = ChatAppDatabase.getInstance();
	try{

		const id = await check_user_credential_valid(user_credential);
		const auth = new Auth({user_id: id});
		await db.exec_db(auth.toInsert());
		return resp.status(200).send({refresh_token: auth.token, auth_token: auth.generate_auth_token()});
	}catch(err: any){
		console.log(err.message);
		if(err.message === error_map.invalid_credentials.error_msg)
			return resp.status(400).send({errors: [error_map.invalid_credentials.error_obj]})
		else if(err.message  === error_map.user_already_logged_in.error_msg)
			return resp.status(400).send({errors: [error_map.user_already_logged_in.error_obj]})
		return resp.sendStatus(500);
	}
}
