import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { ChatRepository } from './chats.repository';

export async function getChats(req: Request, resp: Response) {
	const repo = AppDataSource.getCustomRepository(ChatRepository);
	const chats = await repo.getChats(req.user_id!);

	return resp.status(200).send(chats);
}
