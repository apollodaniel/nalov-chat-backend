export enum ChatErrorCodes {
	CHAT_NOT_FOUND = 'MESSAGE_NOT_FOUND',
	NO_PERMISSION = 'NO_PERMISSION', // user have no permission to do this
}

export const ChatErrorMessages = {
	[ChatErrorCodes.CHAT_NOT_FOUND]: 'Chat not found',
	[ChatErrorCodes.NO_PERMISSION]:
		'You have no permission to execute this action',
};

export const ChatErrorStatusCodes = {
	[ChatErrorCodes.CHAT_NOT_FOUND]: 404,
	[ChatErrorCodes.NO_PERMISSION]: 401,
};
