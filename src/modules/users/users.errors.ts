export enum UserErrorCodes {
	USER_NOT_FOUND = 'USER_NOT_FOUND',
	NO_PERMISSION = 'NO_PERMISSION', // user have no permission to do this
}

export const UserErrorMessages = {
	[UserErrorCodes.USER_NOT_FOUND]: 'User not found',
	[UserErrorCodes.NO_PERMISSION]:
		'You have no permission to execute this action',
};

export const UserErrorStatusCodes = {
	[UserErrorCodes.USER_NOT_FOUND]: 404,
	[UserErrorCodes.NO_PERMISSION]: 401,
};
