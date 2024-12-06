import { ErrorEntry } from '../shared/common.types';

export const MessageErrors: Record<string, ErrorEntry> = {
	MESSAGE_NOT_FOUND: {
		code: 'MESSAGE_NOT_FOUND',
		message: 'Message not found',
		statusCode: 404,
	},
	NO_PERMISSION: {
		code: 'NO_PERMISSION',
		message: 'You have no permission to execute this action',
		statusCode: 401,
	},
};
