import { Request, Response } from 'express';
import { MessageServices } from './messages.services';
import { CommonUtils } from '../shared/common.utils';
import { Message } from './messages.entity';

export class MessageController {
	static async getMessages(req: Request, resp: Response) {
		console.log(req.query.receiverId);
		const messages = await MessageServices.getMessages([
			req.userId!,
			req.query.receiverId!.toString(),
		]);
		return resp.status(200).json(messages);
	}

	static async getMessage(req: Request, resp: Response) {
		try {
			const message = await MessageServices.getMessage(req.params.id!);
			return resp.status(200).send(message);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}

	static async removeMessage(req: Request, resp: Response) {
		const messageId = req.params.id!;

		try {
			// get's message before delete, so the changes can be notified
			const message = await MessageServices.getMessage(messageId);

			await MessageServices.removeMessage(messageId, req.userId!);

			// notify the changes
			await MessageServices.notifyMessageChanges(message);
			return resp.sendStatus(200);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}

	static async addMessage(req: Request, resp: Response) {
		await MessageServices.addMessage({
			...req.body,
			senderId: req.userId!,
		});
		await MessageServices.notifyMessageChanges(req.body.id!);
		return resp.sendStatus(204);
	}

	static async updateMessage(req: Request, resp: Response) {
		try {
			await MessageServices.updateMessage(
				req.params.id!,
				req.userId!,
				req.body,
			);
			// notify the changes
			await MessageServices.notifyMessageChanges(req.params.id!);
			return resp.sendStatus(200);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}
}
