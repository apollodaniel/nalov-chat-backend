import { AppDataSource } from '../../data-source';
import { getChatId } from '../../utils/functions';
import { Message } from './messages.entity';
import { MessageErrorCodes } from './messages.errors';
import { MessageRepository } from './messages.repository';

export class MessageServices {
	private static repo = AppDataSource.getRepository(Message).extend(
		MessageRepository.prototype,
	);

	/* supports both chatID and tuple with senderID and receiverID or vice versa */
	static async getMessages(chatId: string | [string, string]) {
		const messages = await this.repo.getMessages(
			typeof chatId != 'string'
				? getChatId(chatId[0], chatId[1])
				: chatId,
		);

		return messages;
	}

	static async getMessage(messageId: string) {
		const message = await this.repo.getMessage(messageId);

		if (!message) throw new Error(MessageErrorCodes.MESSAGE_NOT_FOUND);

		return message;
	}

	// must verify message owner
	static async removeMessage(messageId: string, userId: string) {
		const message: Message | null = await this.repo.getMessage(messageId);

		if (!message) throw new Error(MessageErrorCodes.MESSAGE_NOT_FOUND);
		else if (message.senderId != userId)
			throw new Error(MessageErrorCodes.NO_PERMISSION);

		await this.repo.removeMessage(messageId);
	}
	// must verify message owner
	static async updateMessage(
		messageId: string,
		userId: string,
		message: Partial<Message>,
	) {
		const oldMessage: Message | null =
			await this.repo.getMessage(messageId);

		if (!oldMessage) throw new Error(MessageErrorCodes.MESSAGE_NOT_FOUND);
		else if (oldMessage.senderId != userId)
			throw new Error(MessageErrorCodes.NO_PERMISSION);

		await this.repo.updateMessage(messageId, message);
	}

	static async addMessage(message: Partial<Message>) {
		await this.repo.addMessage(message);
	}
}
