export enum AuthErrorCodes {
	AUTH_NOT_FOUND = 'AUTH_NOT_FOUND',
	NO_SESSION = 'NO_SESSION',
	INVALID_TOKEN = 'INVALID_TOKEN',
	EXPIRED_SESSION = 'EXPIRED_SESSION',
	NO_PERMISSION = 'NO_PERMISSION', // user have no permission to do this
	REGISTER_FAIL = 'REGISTER_FAIL',
	UNKNOWN_USERNAME = 'UNKNOWN_USERNAME',
	INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',
}

export const AuthErrorMessages = {
	[AuthErrorCodes.AUTH_NOT_FOUND]: 'Auth not found',
	[AuthErrorCodes.NO_SESSION]: 'No session for this user',
	[AuthErrorCodes.EXPIRED_SESSION]:
		'This session is expired, please refresh the authorization token',
	[AuthErrorCodes.NO_PERMISSION]:
		'You have no permission to execute this action',
	[AuthErrorCodes.INVALID_TOKEN]: 'Invalid refresh token, leaving session.',
	[AuthErrorCodes.REGISTER_FAIL]: 'Could not register user',
	[AuthErrorCodes.UNKNOWN_USERNAME]: 'Unknown username',
	[AuthErrorCodes.INCORRECT_PASSWORD]: 'Incorrect password',
};

export const AuthErrorStatusCodes = {
	[AuthErrorCodes.AUTH_NOT_FOUND]: 404,
	[AuthErrorCodes.NO_SESSION]: 602,
	[AuthErrorCodes.NO_PERMISSION]: 401,
	[AuthErrorCodes.EXPIRED_SESSION]: 601,
	[AuthErrorCodes.INVALID_TOKEN]: 400,
	[AuthErrorCodes.REGISTER_FAIL]: 500,
	[AuthErrorCodes.UNKNOWN_USERNAME]: 404,
	[AuthErrorCodes.INCORRECT_PASSWORD]: 401,
};
