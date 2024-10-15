import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Auth } from '../../types/auth';
import { JsonWebTokenError } from 'jsonwebtoken';
import { error_map } from '../constants';
import { ChatAppDatabase } from '../db';

export function validation_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const result = validationResult(req);
	if (!result.isEmpty())
		return resp.status(400).send({ errors: result.array() });

	next();
}

export async function auth_validation_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const result = validationResult(req);
	if (!result.isEmpty())
		return resp.status(400).send({ errors: result.array() });

	const auth_token = req.cookies.authToken;
	if (!auth_token) return resp.sendStatus(601);

	try {
		const token_valid = Auth.verify_auth_token(auth_token, true);

		const verified_refresh_token =
			await Auth.verify_refresh_token(token_valid);
		if (verified_refresh_token) {
			Auth.verify_auth_token(auth_token);
			req.auth = auth_token;
			return next();
		}

		return resp.status(602).send({ error: 'no active session' });
	} catch (err: any) {
		console.log(err.message);
		if (
			err instanceof JsonWebTokenError &&
			err.message.toLowerCase().includes('expired')
		)
			return resp.sendStatus(601); // expired
		else if (err instanceof JsonWebTokenError) return resp.sendStatus(401); // invalid token
		return resp.sendStatus(500);
	}
}
