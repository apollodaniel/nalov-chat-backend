import { NextFunction, Request, Response } from 'express';

export function loggingMiddleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	console.log(`${req.ip} - ${req.method} - ${req.path}`);
	next();
}
