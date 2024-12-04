import { Attachment } from './attachments.entity';
import { AttachmentRepository } from './attachments.repository';

export class AttachmentsServices {
	static async getAttachments(messageId: string): Promise<Attachment[]> {
		return await AttachmentRepository.getAttachments(messageId);
	}
}
