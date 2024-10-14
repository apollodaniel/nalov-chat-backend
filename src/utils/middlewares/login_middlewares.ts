import { NextFunction, Request, Response } from 'express';
import { UserCredentials } from '../../types/types';
import {
	check_user_credential_valid,
	login_user,
	logout_user,
} from '../functions/users';
import { Auth } from '../../types/auth';
import { ChatAppDatabase } from '../db';
import { error_map } from '../constants';
import { JsonWebTokenError } from 'jsonwebtoken';

export async function login_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const user_credential: UserCredentials = req.body;
	try {
		const id = await check_user_credential_valid(user_credential);
		if (id.toString() !== id) {
			return resp.status(400).send({ errors: id });
		}
		const auth = new Auth({ user_id: id });
		await login_user(auth);

		resp.cookie('refreshToken', auth.token, {
			httpOnly: true,
			sameSite: 'strict',
			path: '/auth/token',
		});
		return resp.status(200).send({
			auth_token: auth.generate_auth_token(),
		});
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}

export async function logout_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	try {
		const refresh_token = Auth.verify_auth_token(req.auth);
		await logout_user(refresh_token);
		resp.clearCookie('refreshToken', {
			httpOnly: true,
			sameSite: 'strict',
			path: '/auth/token',
		});
		return resp.sendStatus(200);
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}
