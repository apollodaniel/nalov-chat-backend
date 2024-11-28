import { Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { AuthController } from './auth.controller';
import { REGISTER_VALIDATION_SCHEMA } from './auth.register.validation';
import { LOGIN_VALIDATION_SCHEMA } from './auth.login.validation';
import { TOKEN_VALIDATION_SCHEMA } from './auth.token.validation';
import { ValidationController } from '../shared/validation/validation.controller';

const router = Router();

router.post(
	'/auth/register',
	checkSchema(REGISTER_VALIDATION_SCHEMA),
	ValidationController.validate,
	AuthController.addUser,
);

router.post(
	'/auth/login',
	checkSchema(LOGIN_VALIDATION_SCHEMA),
	ValidationController.validate,
	AuthController.addAuth,
);

router.post('/auth/token', AuthController.refreshSession);

router.post(
	'/auth/check-token',
	checkSchema(TOKEN_VALIDATION_SCHEMA),
	ValidationController.validate,
	AuthController.checkAuthSession,
);

router.post(
	'/auth/logout',
	ValidationController.validateWithAuth,
	AuthController.removeAuth,
);

export default router;
