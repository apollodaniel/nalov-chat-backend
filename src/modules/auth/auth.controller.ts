import { Request, Response } from 'express';
import { AuthServices } from './auth.services';
import { cookieConfig } from '../../utils/constants';
import { AuthErrors } from './auth.errors';
import { CommonUtils } from '../shared/common.utils';

export class AuthController {
	// login
	static async addAuth(req: Request, resp: Response) {
		try {
			// define authorization tokens
			const auth = await AuthServices.addAuth({
				username: req.body.username,
				password: req.body.password,
			});
			const authToken = await AuthServices.refreshSession(auth.token);

			// set tokens to cookies
			resp.cookie(
				cookieConfig.refreshToken.name,
				auth.token, // refresh token
				cookieConfig.refreshToken.options,
			);
			resp.cookie(
				cookieConfig.authToken.name,
				authToken, // auth token
				cookieConfig.authToken.options,
			);

			return resp.sendStatus(200);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}

	// logout
	static async removeAuth(req: Request, resp: Response) {
		try {
			await AuthServices.removeAuth(req.userId!);

			// clear authorization cookies
			resp.clearCookie(
				cookieConfig.refreshToken.name,
				cookieConfig.refreshToken.options,
			);
			resp.clearCookie(
				cookieConfig.authToken.name,
				cookieConfig.authToken.options,
			);

			return resp.sendStatus(200);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}

	// register
	static async addUser(req: Request, resp: Response) {
		try {
			// register user
			await AuthServices.addUser(req.body);

			// login user
			const auth = await AuthServices.addAuth({
				username: req.body.username,
				password: req.body.password,
			});
			const authToken = await AuthServices.refreshSession(auth.token);

			// set tokens to cookies
			resp.cookie(
				cookieConfig.refreshToken.name,
				auth.token, // refresh token
				cookieConfig.refreshToken.options,
			);
			resp.cookie(
				cookieConfig.authToken.name,
				authToken, // auth token
				cookieConfig.authToken.options,
			);

			return resp.sendStatus(200);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}

	static async checkAuthSession(req: Request, resp: Response) {
		const authToken = req.cookies.authToken;
		const refreshToken = req.cookies.refreshToken;
		try {
			if (!refreshToken) throw AuthErrors.NO_SESSION;
			else if (!authToken) throw AuthErrors.EXPIRED_SESSION;

			await AuthServices.checkAuthSession(authToken);
			return resp.sendStatus(200);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}

	static async refreshSession(req: Request, resp: Response) {
		try {
			const refreshToken = req.cookies.refreshToken;
			const authToken = await AuthServices.refreshSession(refreshToken);

			// update token
			resp.cookie(
				cookieConfig.authToken.name,
				authToken,
				cookieConfig.authToken.options,
			);

			return resp.status(200).json({
				token: authToken,
			});
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}
}
