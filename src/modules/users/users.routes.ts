import { Router } from 'express';
import { checkSchema } from 'express-validator';
import {
	USER_GET_SINGLE_VALIDATION_SCHEMA,
	USER_PATCH_SINGLE_VALIDATION_SCHEMA,
	USERS_GET_VALIDATION_SCHEMA,
} from './users.validation';
import { UsersController } from './users.controller';
import { ValidationController } from '../shared/validation/validation.controller';

const router = Router();

router.get(
	'/api/users',
	checkSchema(USERS_GET_VALIDATION_SCHEMA),
	ValidationController.validateWithAuth,
	UsersController.getUsers,
);

router.get(
	'/api/users/current',
	ValidationController.validateWithAuth,
	UsersController.getUser,
);

router.get(
	'/api/users/:id',
	checkSchema(USER_GET_SINGLE_VALIDATION_SCHEMA),
	ValidationController.validateWithAuth,
	UsersController.getUser,
);

router.patch(
	'/api/users/current',
	checkSchema(USER_PATCH_SINGLE_VALIDATION_SCHEMA),
	ValidationController.validateWithAuth,
	UsersController.updateUser,
);

router.delete(
	'/api/users/current',
	ValidationController.validateWithAuth,
	UsersController.removeUser,
);

export default router;
