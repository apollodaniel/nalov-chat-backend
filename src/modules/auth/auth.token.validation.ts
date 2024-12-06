import { Schema } from 'express-validator';

export const TOKEN_VALIDATION_SCHEMA: Schema = {
	type: {
		in: ['body'],
		notEmpty: {
			errorMessage: 'token type must not be empty',
		},
		custom: {
			options: (value) => value === 'Auth' || 'Refresh',
			errorMessage: 'token type must be Auth either Refresh',
		},
	},
};
