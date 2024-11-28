import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { ATTACHMENTS_GET_VALIDATION } from './attachments.validation';
import { AttachmentsController } from './attachments.controller';
import { ValidationController } from '../shared/validation/validation.controller';

const router = Router();

router.get(
	'/api/messages/:id/attachments',
	checkSchema(ATTACHMENTS_GET_VALIDATION),
	ValidationController.validateWithAuth,
	AttachmentsController.getAttachments,
);

export default router;
