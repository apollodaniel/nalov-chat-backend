import { IChat } from '../../types/message';
import { UserRepository } from '../users/users.repository';
import { ChatErrors } from './chats.errors';
import { ChatRepository } from './chats.repository';

export class ChatsServices {
	static async getChats(userId: string): Promise<IChat[]> {
		const userExists = await UserRepository.exists({
			where: {
				id: userId,
			},
		});

		if (!userExists) throw ChatErrors.CHAT_NOT_FOUND;

		return await ChatRepository.getChats(userId);
	}
}
