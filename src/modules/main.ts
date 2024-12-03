import { Router } from 'express';
import auth from './auth/auth.routes';
import message from './messages/messages.routes';
import users from './users/users.routes';
import chats from './chats/chats.routes';
import staticFiles from './static/static.routes';

const router = Router();

router.use(auth);
router.use(message);
router.use(users);
router.use(staticFiles);
router.use(chats);

export default router;
