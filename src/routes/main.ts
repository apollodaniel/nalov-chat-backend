import { Router } from "express";
import auth from './auth';
import message from './message';


const router = Router();

router.use(auth);
router.use(message);


export default router;
