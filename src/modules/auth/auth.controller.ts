import { Request, Response } from 'express';
import {
	AuthErrorCodes,
	AuthErrorMessages,
	AuthErrorStatusCodes,
} from './auth.errors';
import { AuthServices } from './auth.services';
import { cookieConfig } from '../../utils/constants';

export class AuthController {
	// login
	static async addAuth(req: Request, resp: Response) {
		try {
			// define authorization tokens
			const auth = await AuthServices.addAuth(req.body);
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
			this.sendError(resp, err);
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
			this.sendError(resp, err);
		}
	}

	// register
	static async addUser(req: Request, resp: Response) {
		try {
			// register user
			await AuthServices.addUser(req.body);

			// login user
			const auth = await AuthServices.addAuth(req.body);
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
			this.sendError(resp, err);
		}
	}

	static async checkAuthSession(req: Request, resp: Response) {
		const authToken = req.cookies.authToken;
		try {
			await AuthServices.checkAuthSession(authToken);
			return resp.sendStatus(200);
		} catch (err: any) {
			this.sendError(resp, err);
		}
	}

	static async refreshSession(req: Request, resp: Response) {
		try {
			const refreshToken = req.cookies.refreshToken;
			const authToken = await AuthServices.refreshSession(refreshToken);

			// update token
			req.cookies(
				cookieConfig.authToken.name,
				authToken,
				cookieConfig.authToken.options,
			);

			return resp.sendStatus(200);
		} catch (err: any) {
			this.sendError(resp, err);
		}
	}

	private static sendError(resp: Response, err: any) {
		return resp
			.status(AuthErrorStatusCodes[err.message as AuthErrorCodes])
			.json({
				error: {
					kind: 'AUTH',
					code: err.message,
					description:
						AuthErrorMessages[err.message as AuthErrorCodes],
				},
			});
	}
}
