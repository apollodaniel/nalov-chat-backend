import { ErrorEntry } from '../shared/common.types';

export const UserErrors: Record<string, ErrorEntry> = {
	USER_NOT_FOUND: {
		code: 'USER_NOT_FOUND',
		message: 'User not found',
		statusCode: 404,
	},
	NO_PERMISSION: {
		code: 'NO_PERMISSION',
		message: 'You have no permission to execute this action',
		statusCode: 401,
	},
};
