import { AppDataSource } from '../../data-source';
import { EVENT_EMITTER } from '../../utils/constants';
import { getChatId } from '../../utils/functions';
import { Message } from './messages.entity';
import { MessageErrors } from './messages.errors';
import { MessageRepository } from './messages.repository';

export class MessageServices {
	static async notifyMessageChanges(message: Message | string) {
		const _message: Message =
			typeof message == 'string'
				? await MessageServices.getMessage(message)
				: message;

		console.log(_message);
		EVENT_EMITTER.emit(
			`update-${getChatId(_message.senderId, _message.receiverId)}`,
		);
	}

	/* supports both chatID and tuple with senderID and receiverID or vice versa */
	static async getMessages(chatId: string | [string, string]) {
		const messages = await MessageRepository.getMessages(
			typeof chatId != 'string'
				? getChatId(chatId[0], chatId[1])
				: chatId,
		);

		return messages;
	}

	static async getMessage(messageId: string) {
		const message = await MessageRepository.getMessage(messageId);

		if (!message) throw MessageErrors.MESSAGE_NOT_FOUND;

		return message;
	}

	// must verify message owner
	static async removeMessage(messageId: string, userId: string) {
		const message: Message | null =
			await MessageRepository.getMessage(messageId);

		if (!message) throw MessageErrors.MESSAGE_NOT_FOUND;
		else if (message.senderId != userId) throw MessageErrors.NO_PERMISSION;

		await MessageRepository.removeMessage(messageId);
	}

	static async markMessageSeen(
		messages:
			| { senderId: string; receiverId: string }
			| string[]
			| string
			| Message[]
			| Message,
	) {
		await MessageRepository.markMessagesAsSeen(messages);
	}

	// must verify message owner
	static async updateMessage(
		messageId: string,
		userId: string,
		message: Partial<Message>,
	) {
		const oldMessage: Message | null =
			await MessageRepository.getMessage(messageId);

		if (!oldMessage) throw MessageErrors.MESSAGE_NOT_FOUND;
		else if (oldMessage.senderId != userId)
			throw MessageErrors.NO_PERMISSION;

		await MessageRepository.updateMessage(messageId, message);
	}

	static async addMessage(message: Partial<Message>) {
		await MessageRepository.addMessage(message);
	}
}
