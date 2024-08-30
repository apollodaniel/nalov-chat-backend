import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Auth } from "../../types/auth";

export function validation_middleware(req: Request, resp: Response, next: NextFunction){
	const result = validationResult(req);
	if(!result.isEmpty())
		return resp.status(400).send({errors: result.array()});

	next();
}


export function auth_validation_middleware(req: Request, resp: Response, next: NextFunction){
	const result = validationResult(req);
	if(!result.isEmpty())
		return resp.status(400).send({errors: result.array()});

	const auth = (req.headers.authorization || "").split(" ");
	if(auth.length < 2)
		return resp.sendStatus(401);

	try{
		const token_valid = Auth.verify_auth_token(auth[1])
		if(token_valid){
			req.auth = auth[1];
			next()
		}

	}catch(err: any){
		console.log(err.message);
		if(err.message === "jwt_malformed")
			return resp.sendStatus(401);
		return resp.sendStatus(500);
	}
}