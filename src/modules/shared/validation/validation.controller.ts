import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRepository } from '../../auth/auth.repository';
import { AppDataSource } from '../../../data-source';
import { Auth } from '../../auth/auth.entity';
import { ValidationServices } from './validation.services';
import {
	AuthErrorCodes,
	AuthErrorMessages,
	AuthErrorStatusCodes,
} from '../../auth/auth.errors';

export class ValidationController {
	static validate(req: Request, resp: Response, next: NextFunction) {
		const result = validationResult(req);
		if (!result.isEmpty())
			return resp.status(400).send({ errors: result.array() });

		next();
	}

	static async validateWithAuth(
		req: Request,
		resp: Response,
		next: NextFunction,
	) {
		const result = validationResult(req);
		if (!result.isEmpty())
			return resp.status(400).send({ errors: result.array() });

		const authToken = req.cookies.authToken;
		if (!authToken) return resp.sendStatus(601);

		try {
			req.userId = await ValidationServices.checkValidation(authToken);
			return next();
		} catch (err: any) {
			this.sendError(resp, err);
		}
	}
	private static sendError(resp: Response, err: any) {
		return resp
			.status(AuthErrorStatusCodes[err.message as AuthErrorCodes])
			.json({
				error: {
					kind: 'USERS',
					code: err.message,
					description:
						AuthErrorMessages[err.message as AuthErrorCodes],
				},
			});
	}
}
