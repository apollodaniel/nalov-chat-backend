import express, { Request, Response } from 'express';
import { ValidationController } from '../shared/validation/validation.controller';
import { StaticController } from './static.controller';

const router = express.Router();

// check for permission to acess files
router.get('/files/chats/', StaticController.checkPermission);

router.use('/files', express.static('files/'));
router.use(
	'/public/profile-pictures',
	express.static('public/profile-picture'),
);
router.use(
	'/default/profile-pictures',
	express.static('default/profile-picture'),
);

router.post(
	'/api/upload',
	ValidationController.validateWithAuth,
	StaticController.fileUpload,
	(req: Request, resp: Response) => {
		return resp.sendStatus(204);
	},
);

export default router;
