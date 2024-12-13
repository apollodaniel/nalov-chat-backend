import { Response } from 'express';
import { ErrorEntry } from './common.types';

export class CommonUtils {
	static sendError(resp: Response, err: ErrorEntry) {
		return resp.status(err.statusCode || 500).json({
			errors: [err],
		});
	}
	static getChatId(user1: string, user2: string) {
		return Array.from([user1, user2]).sort().join('|');
	}
	static parseChatId(chatId: string): string[] {
		return chatId.split('|');
	}
}
