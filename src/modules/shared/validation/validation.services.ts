import { FieldValidationError, ValidationError } from 'express-validator';
import { AuthRepository } from '../../auth/auth.repository';
import { ErrorEntry } from '../common.types';

export class ValidationServices {
	static async checkValidation(authToken: string) {
		const isOk = await AuthRepository.checkAuthSession(authToken);

		if (typeof isOk != 'string') throw new Error(isOk);

		return isOk;
	}

	static parseErrors(errors: ValidationError[]): ErrorEntry[] {
		return errors.map((err) => {
			return {
				code: err.msg.code || 'FIELD_ERROR',
				message: err.msg.message || err.msg,
				field: err.type == 'field' ? err.path : undefined,
				statusCode: 400,
			};
		});
	}
}
