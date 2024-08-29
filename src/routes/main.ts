import { Router } from "express";
import auth from './auth';
import message from './message';
import users from './users';

const router = Router();

router.use(auth);
router.use(message);
router.use(users);

export default router;
