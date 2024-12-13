import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ValidationServices } from './validation.services';
import { ErrorEntry } from '../common.types';
import { CommonUtils } from '../common.utils';

export class ValidationController {
	static validate(req: Request, resp: Response, next: NextFunction) {
		const result = validationResult(req);
		if (!result.isEmpty())
			return resp.status(400).send({
				errors: ValidationServices.parseErrors(result.array()),
			});

		next();
	}

	static async validateWithAuth(
		req: Request,
		resp: Response,
		next: NextFunction,
	) {
		const result = validationResult(req);
		if (!result.isEmpty())
			return resp.status(400).send({
				errors: ValidationServices.parseErrors(result.array()),
			});

		const authToken = req.cookies.authToken;
		if (!authToken) return resp.sendStatus(601);

		try {
			req.userId = await ValidationServices.checkValidation(authToken);
			return next();
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}
}
