import { NextFunction, Request, Response } from 'express';
import { Auth } from '../../types/auth';
import { check_user_token_valid } from '../functions/users';

export function token_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const ref_token = req.cookies.refreshToken;

	if (!ref_token) return resp.sendStatus(401);

	try {
		const refresh_token_auth = new Auth({ token: ref_token });
		const auth_token = refresh_token_auth.generate_auth_token();
		return resp.status(200).send({ auth_token: auth_token });
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
	let valid = await check_user_token_valid(req.body.token, req.body.type);
	return resp.send({ valid: valid });
}
