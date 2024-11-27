import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { ATTACHMENTS_GET_VALIDATION } from './attachments.validation';
import { authValidationMiddleware } from '../shared/validation/validation.middlewares';
import { AttachmentsController } from './attachments.controller';

const router = Router();

router.get(
	'/api/messages/:id/attachments',
	checkSchema(ATTACHMENTS_GET_VALIDATION),
	authValidationMiddleware,
	AttachmentsController.getAttachments,
);

export default router;
