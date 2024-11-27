export enum MessageErrorCodes {
	MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
	NO_PERMISSION = 'NO_PERMISSION', // user have no permission to do this
}

export const MessageErrorMessages = {
	[MessageErrorCodes.MESSAGE_NOT_FOUND]: 'Message not found',
	[MessageErrorCodes.NO_PERMISSION]:
		'You have no permission to execute this action',
};

export const MessageErrorStatusCodes = {
	[MessageErrorCodes.MESSAGE_NOT_FOUND]: 404,
	[MessageErrorCodes.NO_PERMISSION]: 401,
};
