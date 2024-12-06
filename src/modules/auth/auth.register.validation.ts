import { body, Schema } from 'express-validator';
import { v4 as gen_v4 } from 'uuid';
import { USERNAME_VALIDATION_REGEX } from '../shared/common.constants';

export const REGISTER_VALIDATION_SCHEMA: Schema = {
	id: {
		customSanitizer: {
			options: () => gen_v4(),
		},
	},
	username: {
		in: ['body'],
		notEmpty: {
			errorMessage: 'username must not be empty',
		},
		isString: {
			errorMessage: 'username must be a valid string',
		},
		isLength: {
			options: {
				min: 4,
				max: 12,
			},
		},
		matches: {
			options: RegExp(USERNAME_VALIDATION_REGEX),
			errorMessage: 'invalid username',
		},
	},
	name: {
		in: ['body'],
		notEmpty: {
			errorMessage: 'name must not be empty',
		},
		isString: {
			errorMessage: 'name must be a valid string',
		},
		isLength: {
			options: {
				min: 4,
				max: 100,
			},
		},
	},
	password: {
		in: ['body'],
		notEmpty: {
			errorMessage: 'password must not be empty',
		},
		isString: {
			errorMessage: 'password must be a valid string',
		},
		isStrongPassword: {
			errorMessage: 'password is weak',
		},
		isLength: {
			options: {
				min: 8,
			},
			errorMessage: 'password must be at least 8 characters long',
		},
	},
};
