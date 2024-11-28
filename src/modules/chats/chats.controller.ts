import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { ChatRepository } from './chats.repository';
import { ChatsServices } from './chats.services';
import {
	ChatErrorCodes,
	ChatErrorMessages,
	ChatErrorStatusCodes,
} from './chats.errors';

export class ChatsController {
	static async getChats(req: Request, resp: Response) {
		try {
			const chats = ChatsServices.getChats(req.userId!);

			return resp.status(200).json(chats);
		} catch (err: any) {
			this.sendError(resp, err);
		}
	}

	private static sendError(resp: Response, err: any) {
		return resp
			.status(ChatErrorStatusCodes[err.message as ChatErrorCodes])
			.json({
				error: {
					kind: 'CHAT',
					code: err.message,
					description:
						ChatErrorMessages[err.message as ChatErrorCodes],
				},
			});
	}
}
