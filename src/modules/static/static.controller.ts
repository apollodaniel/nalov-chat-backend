import { NextFunction, Request, Response } from 'express';
import { StaticFileErrors } from './static.errors';
import { MessageServices } from '../messages/messages.services';
import { StaticServices } from './static.services';
import { CommonUtils } from '../shared/common.utils';

export class StaticController {
	static async checkPermission(
		req: Request,
		resp: Response,
		next: NextFunction,
	) {
		const splitted_path = req.path
			.replace('/files/chats/', '')
			.split('/')[0];

		if (req.userId && splitted_path.includes(req.userId)) {
			return next();
		}

		// unauthorized
		CommonUtils.sendError(resp, StaticFileErrors.NO_PERMISSION);
	}

	static async fileUpload(req: Request, resp: Response) {
		if (
			!req.headers['content-type'] ||
			!req.headers['content-type']?.startsWith('multipart/form-data')
		)
			return resp.sendStatus(400);

		const messageId: string | undefined = req.query.message_id?.toString();

		// check messageId
		if (!messageId) return resp.sendStatus(401);

		//const userId = new Auth({ token: Auth.verify_auth_token(req.auth) })
		//	.userId;
		const message = await MessageServices.getMessage(messageId);

		try {
			const { onData, onEnd, onError } = await StaticServices.fileUpload(
				message,
				req.headers,
			);

			console.log('Started receiving file');

			req.on('data', onData);
			req.on('end', onEnd);
			req.on('close', onEnd);
			req.on('error', (e) => {
				CommonUtils.sendError(resp, onError(e));
			});
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}
}
