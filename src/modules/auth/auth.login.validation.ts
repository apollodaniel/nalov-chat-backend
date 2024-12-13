import { Schema } from 'express-validator';
import { USERNAME_VALIDATION_REGEX } from '../shared/common.constants';

export const LOGIN_VALIDATION_SCHEMA: Schema = {
	username: {
		in: ['body'],
		notEmpty: {
			errorMessage: {
				code: 'EMPTY_USERNAME',
				message: 'Username must not be empty.',
			},
		},
		matches: {
			options: USERNAME_VALIDATION_REGEX,
			errorMessage: {
				code: 'INVALID_USERNAME',
				message: 'Invalid username format.',
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
		isStrongPassword: {
			errorMessage: {
				code: 'INVALID_PASSWORD',
				message: 'Password must meet the security requirements.',
			},
		},
	},
};
