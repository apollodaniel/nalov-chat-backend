import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AppDataSource } from '../../../data-source';
import { AuthRepository } from '../../auth/auth.repository';
import { Auth } from '../../auth/auth.entity';

export function validationMiddleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const result = validationResult(req);
	if (!result.isEmpty())
		return resp.status(400).send({ errors: result.array() });

	next();
}

export async function authValidationMiddleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const result = validationResult(req);
	if (!result.isEmpty())
		return resp.status(400).send({ errors: result.array() });

	const authToken = req.cookies.authToken;

	if (!authToken) return resp.sendStatus(601);

	const authRepository = AppDataSource.getRepository(Auth).extend(
		AuthRepository.prototype,
	);
	try {
		// gets refresh token without expiration check
		const isOk = await authRepository.checkAuthSession(authToken);

		if (!isOk) return resp.status(602).send({ error: 'no active session' });

		req.user_id = isOk;

		return next();
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
