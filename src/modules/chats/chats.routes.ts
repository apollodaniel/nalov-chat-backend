import { Router } from 'express';
import { ValidationController } from '../shared/validation/validation.controller';
import { ChatsController } from './chats.controller';

const router = Router();

router.get(
	'/api/chats',
	ValidationController.validateWithAuth,
	ChatsController.getChats,
);

export default router;
