import express, { Request, Response } from 'express';
import { ValidationController } from '../shared/validation/validation.controller';
import { receive_file_middleware } from '../../utils/middlewares/receive_file_middleware';

const router = express.Router();

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
	receive_file_middleware,
	(req: Request, resp: Response) => {
		return resp.sendStatus(204);
	},
);

export default router;
