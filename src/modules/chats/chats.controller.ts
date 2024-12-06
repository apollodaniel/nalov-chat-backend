import { Request, Response } from 'express';
import { ChatsServices } from './chats.services';
import { CommonUtils } from '../shared/common.utils';

export class ChatsController {
	static async getChats(req: Request, resp: Response) {
		try {
			const chats = await ChatsServices.getChats(req.userId!);

			return resp.status(200).json(chats);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}
}
