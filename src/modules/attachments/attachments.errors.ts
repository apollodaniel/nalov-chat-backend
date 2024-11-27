export enum AttachmentsErrorCodes {
	MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
	NO_PERMISSION = 'NO_PERMISSION', // user have no permission to do this
}

export const AttachmentsErrorMessages = {
	[AttachmentsErrorCodes.MESSAGE_NOT_FOUND]: 'Message not found',
	[AttachmentsErrorCodes.NO_PERMISSION]:
		'You have no permission to execute this action',
};

export const AttachmentsErrorStatusCodes = {
	[AttachmentsErrorCodes.MESSAGE_NOT_FOUND]: 404,
	[AttachmentsErrorCodes.NO_PERMISSION]: 401,
};
