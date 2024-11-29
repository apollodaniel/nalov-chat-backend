import { NextFunction, Request, Response } from 'express';
import {
	StaticFileErrorCodes,
	StaticFileErrorMessages,
	StaticFileErrorStatusCodes,
} from './static.errors';
import { MessageServices } from '../messages/messages.services';
import { StaticServices } from './static.services';

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
		this.sendError(resp, new Error(StaticFileErrorCodes.NO_PERMISSION));
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
			const { onData, onExit, onError } = await StaticServices.fileUpload(
				message,
				req.headers,
			);

			req.on('data', onData);
			req.on('end', onExit);
			req.on('close', onExit);
			req.on('error', (e) => {
				this.sendError(resp, onError(e));
			});
		} catch (err: any) {
			this.sendError(resp, err);
		}
	}

	private static sendError(resp: Response, err: any) {
		return resp
			.status(
				StaticFileErrorStatusCodes[err.message as StaticFileErrorCodes],
			)
			.json({
				error: {
					kind: 'MESSAGE',
					code: err.message,
					description:
						StaticFileErrorMessages[
							err.message as StaticFileErrorCodes
						],
				},
			});
	}
}
