import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";


export function loggin_middleware(req: Request, resp: Response, next: NextFunction){
	console.log(`${req.ip} - ${req.method} - ${req.path}`);
	next();
}


