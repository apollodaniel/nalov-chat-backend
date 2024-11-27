import { Router } from 'express';

const router = Router();

router.get('/api/chats', auth_validation_middleware, chats_get_middleware);

export default router;
