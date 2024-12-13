import { body, Schema } from 'express-validator';
import { v4 as gen_v4 } from 'uuid';
import {
	FULLNAME_VALIDATION_REGEX,
	USERNAME_VALIDATION_REGEX,
} from '../shared/common.constants';

export const REGISTER_VALIDATION_SCHEMA: Schema = {
	id: {
		customSanitizer: {
			options: () => gen_v4(),
		},
	},
	username: {
		in: ['body'],
		notEmpty: {
			errorMessage: {
				code: 'EMPTY_USERNAME',
				message: 'Username must not be empty.',
			},
		},
		isString: {
			errorMessage: {
				code: 'INVALID_USERNAME_TYPE',
				message: 'Username must be a valid string.',
			},
		},
		isLength: {
			options: {
				min: 4,
				max: 12,
			},
			errorMessage: {
				code: 'INVALID_USERNAME_LENGTH',
				message: 'Username must be between 4 and 12 characters long.',
			},
		},
		matches: {
			options: RegExp(USERNAME_VALIDATION_REGEX),
			errorMessage: {
				code: 'INVALID_USERNAME',
				message: 'Invalid username format.',
			},
		},
	},
	name: {
		in: ['body'],
		notEmpty: {
			errorMessage: {
				code: 'EMPTY_NAME',
				message: 'Name must not be empty.',
			},
		},
		isString: {
			errorMessage: {
				code: 'INVALID_NAME_TYPE',
				message: 'Name must be a valid string.',
			},
		},
		matches: {
			options: RegExp(FULLNAME_VALIDATION_REGEX),
			errorMessage: {
				code: 'INVALID_FULLNAME',
				message: 'Invalid name format.',
			},
		},
		isLength: {
			options: {
				min: 4,
				max: 100,
			},
			errorMessage: {
				code: 'INVALID_NAME_LENGTH',
				message: 'Name must be between 4 and 100 characters long.',
			},
		},
	},
	password: {
		in: ['body'],
		notEmpty: {
			errorMessage: {
				code: 'EMPTY_PASSWORD',
				message: 'Password must not be empty.',
			},
		},
		isString: {
			errorMessage: {
				code: 'INVALID_PASSWORD_TYPE',
				message: 'Password must be a valid string.',
			},
		},
		isStrongPassword: {
			errorMessage: {
				code: 'WEAK_PASSWORD',
				message:
					'Password is too weak. It must include uppercase, lowercase, numbers, and special characters.',
			},
		},
		isLength: {
			options: {
				min: 8,
			},
			errorMessage: {
				code: 'INVALID_PASSWORD_LENGTH',
				message: 'Password must be at least 8 characters long.',
			},
		},
	},
};
