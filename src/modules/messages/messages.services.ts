import { v4 } from 'uuid';
import fs from 'fs';
import { join } from 'path';
import { getAttachmentPath } from '../attachments/attachments.functions';
import { AttachmentRepository } from '../attachments/attachments.repository';
import { Message } from './messages.entity';
import { MessageErrors } from './messages.errors';
import { MessageRepository } from './messages.repository';
import { EVENT_EMITTER } from '../shared/common.constants';
import { CommonUtils } from '../shared/common.utils';

export class MessageServices {
	static async notifyMessageChanges(message: Message | string) {
		const _message: Message =
			typeof message == 'string'
				? await MessageServices.getMessage(message)
				: message;

		EVENT_EMITTER.emit(
			`update-${CommonUtils.getChatId(_message.senderId, _message.receiverId)}`,
		);
	}

	/* supports both chatID and tuple with senderID and receiverID or vice versa */
	static async getMessages(chatId: string | [string, string]) {
		const messages = await MessageRepository.getMessages(
			typeof chatId != 'string'
				? CommonUtils.getChatId(chatId[0], chatId[1])
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

		if (message)
			fs.promises.rm(
				join(
					'files/',
					CommonUtils.getChatId(message.senderId, message.receiverId),
					message!.id,
				),
				{ recursive: true, force: true },
			);

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
		if (message.attachments) {
			message.attachments = message.attachments.map((att) => {
				const id = v4();
				return AttachmentRepository.create({
					...att,
					id,
					messageId: message.id,
					path: getAttachmentPath(
						CommonUtils.getChatId(
							message.senderId!,
							message.receiverId!,
						),
						message.id!,
						id,
						att.filename,
					) as string,
					date: Date.now(),
				});
			});
		}
		return await MessageRepository.addMessage(message);
	}
}
