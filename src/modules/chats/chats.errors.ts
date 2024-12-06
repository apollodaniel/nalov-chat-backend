import { ErrorEntry } from '../shared/common.types';

export const ChatErrors: Record<string, ErrorEntry> = {
	CHAT_NOT_FOUND: {
		code: 'CHAT_NOT_FOUND',
		message: 'Chat not found',
		statusCode: 404,
	},
	NO_PERMISSION: {
		code: 'NO_PERMISSION',
		message: 'You have no permission to execute this action',
		statusCode: 401,
	},
};
