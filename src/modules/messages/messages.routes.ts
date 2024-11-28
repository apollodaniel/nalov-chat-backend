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
import { ValidationController } from '../shared/validation/validation.controller';

const router = Router();

router.get(
	'/api/messages',
	checkSchema(MESSAGE_GET_VALIDATION),
	ValidationController.validateWithAuth,
	MessageController.getMessages,
);

router.get(
	'/api/messages/:id',
	checkSchema(MESSAGE_GET_SINGLE_VALIDATION),
	ValidationController.validateWithAuth,
	MessageController.getMessage,
);

router.post(
	'/api/messages',
	checkSchema(MESSAGE_POST_VALIDATION),
	ValidationController.validateWithAuth,
	MessageController.addMessage,
);

router.patch(
	'/api/messages/:id',
	checkSchema(MESSAGE_PATCH_VALIDATION),
	ValidationController.validateWithAuth,
	MessageController.updateMessage,
);

router.delete(
	'/api/messages/:id',
	checkSchema(MESSAGE_DELETE_SINGLE_VALIDATION),
	ValidationController.validateWithAuth,
	MessageController.removeMessage,
);

export default router;
