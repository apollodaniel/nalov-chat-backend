import { Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { REGISTER_VALIDATION_SCHEMA } from '../utils/validation_schemas/register_validation';
import { register_middleware } from '../utils/middlewares/register_middleware';
import { LOGIN_VALIDATION_SCHEMA } from '../utils/validation_schemas/login_validation';
import {
	login_middleware,
	logout_middleware,
} from '../utils/middlewares/login_middlewares';
import {
	check_token_middleware,
	token_middleware,
} from '../utils/middlewares/token_middleware';
import {
	auth_validation_middleware,
	validation_middleware,
} from '../utils/middlewares/validation_middleware';
import { TokenExpiredError } from 'jsonwebtoken';
import { TOKEN_VALIDATION_SCHEMA } from '../utils/validation_schemas/token_validation';
import { delete_user_middleware } from '../utils/middlewares/users';

const router = Router();

router.post(
	'/auth/register',
	checkSchema(REGISTER_VALIDATION_SCHEMA),
	validation_middleware,
	register_middleware,
);

router.post(
	'/auth/login',
	checkSchema(LOGIN_VALIDATION_SCHEMA),
	validation_middleware,
	login_middleware,
);

router.delete(
	'/auth/account',
	auth_validation_middleware,
	delete_user_middleware,
);

router.post('/auth/token', token_middleware);

router.post(
	'/auth/check-token',
	checkSchema(TOKEN_VALIDATION_SCHEMA),
	validation_middleware,
	check_token_middleware,
);

router.post('/auth/logout', auth_validation_middleware, logout_middleware);

export default router;
