import { NextFunction, Request, Response } from 'express';
import { Auth } from '../../types/auth';
import { check_user_token_valid, logout_user } from '../functions/users';
import { cookieConfig } from '../constants';
import { ChatAppDatabase } from '../db';
import { cookie } from 'express-validator';

export function token_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const ref_token = req.cookies.refreshToken;

	if (!ref_token) return resp.sendStatus(602);

	try {
		const refresh_token_auth = new Auth({ token: ref_token });
		const auth_token = refresh_token_auth.generate_auth_token();
		resp.cookie(
			cookieConfig.authToken.name,
			auth_token,
			cookieConfig.authToken.options,
		);
		return resp.status(200).send({ token: auth_token });
	} catch (err: any) {
		console.log(err.message);
		if (err.message === 'invalid token' || err.message === 'jwt_malformed')
			return resp.sendStatus(401);
		return resp.sendStatus(500);
	}
}

export async function check_token_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth_token = req.cookies.authToken;
	const refresh_token = req.cookies.refreshToken;

	if (!refresh_token) return resp.sendStatus(602);
	if (!auth_token) return resp.sendStatus(601);

	const auth = new Auth({ token: refresh_token });
	const db = ChatAppDatabase.getInstance();

	const result = (
		await db.query_db(
			`SELECT * FROM users WHERE id = '${auth.user_id}' limit 1`,
		)
	).rowCount;
	if (result === 0) {
		// user doesn't exists
		// clear auth tokens
		// and remove auth registry
		resp.clearCookie(
			cookieConfig.refreshToken.name,
			cookieConfig.refreshToken.options,
		);
		resp.clearCookie(
			cookieConfig.authToken.name,
			cookieConfig.authToken.options,
		);

		await logout_user(refresh_token);

		return resp.sendStatus(602);
	}

	return resp.send({ valid: true });
}
