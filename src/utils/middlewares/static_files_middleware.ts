import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";


export function static_files_middleware(req: Request, resp: Response, next: NextFunction){
	let path = req.path;
	const splitted_path = path.split("/").filter((p)=>p.trim() !== "");

	const user_id = new Auth({token: Auth.verify_auth_token(req.auth!)}).user_id;

	try{
		if(splitted_path.length >= 2 && splitted_path[1].includes(user_id)){
			// user has the permission of that chat
			return next();
		}
		return resp.sendStatus(401);
	}catch(err: any){
		console.log(err.message);
		return resp.sendStatus(500);
	}
}
