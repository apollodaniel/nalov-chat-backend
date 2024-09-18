import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";


export function static_files_middleware(req: Request, resp: Response, next: NextFunction){
	let path = req.originalUrl;
	path = path.substring(1, path.length - 1);
	const splitted_path = path.split("/");

	if(splitted_path.length < 2)
		return resp.sendStatus(404);

	if(splitted_path[0] != "attachments")
		return next();


	const user_id = new Auth({token: Auth.verify_auth_token(req.auth!)}).user_id;

	try{
		if(splitted_path.length >= 3 && splitted_path[3].trim().split("_").find((a) => a === user_id)){
			// user has the permission of that chat
			return next();
		}
		return resp.sendStatus(401);
	}catch(err: any){
		console.log(err.message);
		return resp.sendStatus(500);
	}
}
