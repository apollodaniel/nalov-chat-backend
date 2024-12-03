import { AppDataSource } from '../../data-source';
import { Message } from '../messages/messages.entity';
import { MessageRepository } from '../messages/messages.repository';
import { Attachment } from './attachments.entity';
import { AttachmentsErrors } from './attachments.errors';

export class AttachmentsServices {
	static async getAttachments(
		userId: string,
		messageId: string,
	): Promise<Attachment[]> {
		const message = await MessageRepository.createQueryBuilder()
			.whereInIds(messageId)
			.getOne();
		if (!message) throw AttachmentsErrors.MESSAGE_NOT_FOUND;
		else if (message?.senderId != userId && message?.receiverId != userId) {
			throw AttachmentsErrors.NO_PERMISSION;
		}

		return message.attachments;
	}
}
