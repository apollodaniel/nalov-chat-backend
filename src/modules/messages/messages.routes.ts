import { Router } from 'express';
import { checkSchema } from 'express-validator';
import {
	MESSAGE_DELETE_SINGLE_VALIDATION,
	MESSAGE_GET_SINGLE_VALIDATION,
	MESSAGE_GET_VALIDATION,
	MESSAGE_PATCH_VALIDATION,
	MESSAGE_POST_VALIDATION,
} from './messages.validation';
import { MessageController } from './messages.controller';
import { authValidationMiddleware } from '../shared/validation/validation.middlewares';

const router = Router();

router.get(
	'/api/messages',
	checkSchema(MESSAGE_GET_VALIDATION),
	authValidationMiddleware,
	MessageController.getMessages,
);

router.get(
	'/api/messages/:id',
	checkSchema(MESSAGE_GET_SINGLE_VALIDATION),
	authValidationMiddleware,
	MessageController.getSingle,
);

router.post(
	'/api/messages',
	checkSchema(MESSAGE_POST_VALIDATION),
	authValidationMiddleware,
	MessageController.addMessage,
);

router.patch(
	'/api/messages/:id',
	checkSchema(MESSAGE_PATCH_VALIDATION),
	authValidationMiddleware,
	MessageController.updateMessage,
);

router.delete(
	'/api/messages/:id',
	checkSchema(MESSAGE_DELETE_SINGLE_VALIDATION),
	authValidationMiddleware,
	MessageController.removeMessage,
);

export default router;
