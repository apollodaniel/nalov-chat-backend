import { ErrorEntry } from '../shared/common.types';

export const StaticFileErrors: Record<string, ErrorEntry> = {
	NO_PERMISSION: {
		code: 'NO_PERMISSION',
		message: 'You have no permission to execute this action',
		statusCode: 401,
	},
	UNKNOWN_ERROR: {
		code: 'UNKNOWN_ERROR',
		message: 'AN UNKNOWN ERROR OCCURRED',
		statusCode: 500,
	},
	NO_ATTACHMENTS: {
		code: 'NO_ATTACHMENTS',
		message: 'There is no attachment available for this message',
		statusCode: 400,
	},
};
