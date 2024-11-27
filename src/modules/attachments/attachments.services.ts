import { AppDataSource } from '../../data-source';
import { Message } from '../messages/messages.entity';
import { MessageRepository } from '../messages/messages.repository';
import { Attachment } from './attachments.entity';
import { AttachmentsErrorCodes } from './attachments.errors';

export class AttachmentsServices {
	private static messagesRepository =
		AppDataSource.getRepository(Message).extend(MessageRepository);
	static async getAttachments(
		userId: string,
		messageId: string,
	): Promise<Attachment[]> {
		const message = await this.messagesRepository
			.createQueryBuilder()
			.whereInIds(messageId)
			.getOne();
		if (!message) throw new Error(AttachmentsErrorCodes.MESSAGE_NOT_FOUND);
		else if (message?.senderId != userId && message?.receiverId != userId) {
			throw new Error(AttachmentsErrorCodes.NO_PERMISSION);
		}

		return message.attachments;
	}
}
