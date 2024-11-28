import { AppDataSource } from '../../data-source';
import { IChat } from '../../types/message';
import { Message } from '../messages/messages.entity';
import { User } from '../users/users.entity';
import { UserRepository } from '../users/users.repository';
import { ChatErrorCodes } from './chats.errors';
import { ChatRepository } from './chats.repository';

export class ChatsServices {
	private static repo = AppDataSource.getRepository(Message).extend(
		ChatRepository.prototype,
	);
	private static usersRepo = AppDataSource.getRepository(User).extend(
		UserRepository.prototype,
	);

	static async getChats(userId: string): Promise<IChat[]> {
		const userExists = await this.usersRepo.exists({
			where: {
				id: userId,
			},
		});

		if (!userExists) throw new Error(ChatErrorCodes.CHAT_NOT_FOUND);

		return await this.repo.getChats(userId);
	}
}
