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

	const authToken = req.cookies.authToken;
	const refreshToken = req.cookies.refreshToken;

	if (!authToken) return resp.sendStatus(601);

	try {
		// gets refresh token without expiration check
		Auth.verify_auth_token(authToken, true);

		const verified_refresh_token =
			await Auth.verify_refresh_token(refreshToken);
		if (verified_refresh_token) {
			Auth.verify_auth_token(authToken); // check if is valid considering the expiration

			req.auth = authToken;
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
