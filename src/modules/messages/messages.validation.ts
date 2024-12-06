import { Schema } from 'express-validator';
import { v4 as gen_v4 } from 'uuid';

export const MESSAGE_GET_SINGLE_VALIDATION: Schema = {
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

export const MESSAGE_DELETE_SINGLE_VALIDATION: Schema = {
	id: {
		in: ['params'],
		notEmpty: {
			errorMessage: 'id must not be empty',
		},
		isString: {
			errorMessage: 'id must be a string',
		},
	},
};

export const MESSAGE_GET_VALIDATION: Schema = {
	receiverId: {
		in: ['query'],
		notEmpty: {
			errorMessage: 'receiverId must not be empty',
		},
		isString: {
			errorMessage: 'receiverId must be a valid string',
		},
	},
};

export const MESSAGE_POST_VALIDATION: Schema = {
	id: {
		in: ['body'],
		customSanitizer: {
			options: () => gen_v4(),
		},
	},
	receiverId: {
		in: ['body'],
		notEmpty: {
			errorMessage: 'receiverId must not be empty',
		},
		isString: {
			errorMessage: 'receiverId must be a valid string',
		},
	},
	content: {
		in: ['body'],
		isString: {
			errorMessage: 'content must be a string',
		},
		isLength: {
			options: {
				max: 300,
			},
			errorMessage: 'content must be between 1-300 char long',
		},
	},
	// date: {
	// 	in: ["body"],
	// 	customSanitizer: {
	// 		options: () => Date.now(),
	// 	},
	// }
	//creationDate: {
	//	in: ['body'],
	//	customSanitizer: {
	//		options: () => Date.now(),
	//	},
	//},
	//lastModifiedDate: {
	//	in: ['body'],
	//	customSanitizer: {
	//		options: () => Date.now(),
	//	},
	//},
};

export const MESSAGE_PATCH_VALIDATION: Schema = {
	id: {
		in: ['params'],
		notEmpty: {
			errorMessage: 'id must not be empty',
		},
		isString: {
			errorMessage: 'id must be a string',
		},
	},
	content: {
		in: ['body'],
		optional: true,
		notEmpty: {
			errorMessage: 'content must not be empty',
		},
		isString: {
			errorMessage: 'content must be a string',
		},
		isLength: {
			options: {
				min: 1,
				max: 300,
			},
			errorMessage: 'content must be between 1-300 char long',
		},
	},
	lastModifiedDate: {
		in: ['body'],
		customSanitizer: {
			options: () => Date.now(),
		},
	},
};
