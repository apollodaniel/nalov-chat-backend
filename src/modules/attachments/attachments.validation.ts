import { Schema } from 'express-validator';

export const ATTACHMENTS_GET_VALIDATION: Schema = {
	id: {
		in: ['params'],
		notEmpty: {
			errorMessage: 'id must not be empty',
		},
		isString: {
			errorMessage: 'id must be a valid string',
		},
	},
};
