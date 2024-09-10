import { Router } from "express";
import auth from './auth';
import message from './message';
import users from './users';
import static_files from './static_files';

const router = Router();

router.use(auth);
router.use(message);
router.use(users);
router.use(static_files);

export default router;
