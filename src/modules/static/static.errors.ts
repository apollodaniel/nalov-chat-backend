export enum StaticFileErrorCodes {
	NO_PERMISSION = 'NO_PERMISSION', // user have no permission to do this
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	NO_ATTACHMENTS = 'NO_ATTACHMENTS', // user have no permission to do this
}

export const StaticFileErrorMessages = {
	[StaticFileErrorCodes.NO_PERMISSION]:
		'You have no permission to execute this action',
	[StaticFileErrorCodes.UNKNOWN_ERROR]: 'AN UNKNOWN ERROR OCCURRED',
	[StaticFileErrorCodes.NO_ATTACHMENTS]:
		'There is no attachment available for this message',
};

export const StaticFileErrorStatusCodes = {
	[StaticFileErrorCodes.NO_PERMISSION]: 401,
	[StaticFileErrorCodes.UNKNOWN_ERROR]: 500,
	[StaticFileErrorCodes.NO_ATTACHMENTS]: 400,
};
