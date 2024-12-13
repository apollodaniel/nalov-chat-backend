import { Schema } from 'express-validator';
import { User } from './users.entity';
import { FULLNAME_VALIDATION_REGEX } from '../shared/common.constants';

export const USER_GET_SINGLE_VALIDATION_SCHEMA: Schema = {
	id: {
		notEmpty: {
			errorMessage: 'id must not be empty',
		},
		isString: {
			errorMessage: 'id must be a valid string',
		},
	},
};

export const USERS_GET_VALIDATION_SCHEMA: Schema = {
	asc: {
		in: ['query'],
		optional: true,
		isBoolean: {
			errorMessage:
				'asc must be a valid boolean: true -> asc and false -> desc',
		},
	},
	orderBy: {
		in: ['query'],
		optional: true,
		isString: {
			errorMessage:
				'orderBy must be a valid string that corresponds a user field name',
		},
		matches: {
			options: new RegExp(
				`\\b(${Object.keys(User)
					.map((e) => `${e}`)
					.join('|')})\\b`,
			),
			errorMessage: `orderBy must be a valid field`,
		},
	},
	limit: {
		in: ['query'],
		optional: true,
		isInt: {
			errorMessage: 'limit field must be a valid integer',
		},
		customSanitizer: {
			options: (value) => (value ? value : 0),
		},
	},
};

export const USER_PATCH_SINGLE_VALIDATION_SCHEMA: Schema = {
	name: {
		in: ['query', 'body'],
		optional: true,
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
};
