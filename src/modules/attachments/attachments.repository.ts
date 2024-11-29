import { EntityRepository, Repository } from 'typeorm';
import { Attachment } from '../entity/Attachment';

export class AttachmentRepository extends Repository<Attachment> {
	async getAttachments(messageId: string): Promise<Attachment[]> {
		return this.createQueryBuilder()
			.where({
				messageId: messageId,
			})
			.getMany();
	}
	async addAttachment(
		attachment: Partial<Attachment> | Partial<Attachment>[],
	): Promise<void> {
		await this.manager.save(attachment);
	}

	async updateAttachment(
		attachmentId: string,
		attachment: Partial<Attachment>,
	) {
		this.createQueryBuilder().whereInIds(attachmentId).update(attachment);
	}
	async updateAttachments(
		attachments: {
			attachmentId: string;
			attachment: Partial<Attachment>;
		}[],
	) {
		for (const { attachmentId, attachment } of attachments) {
			this.createQueryBuilder()
				.whereInIds(attachmentId)
				.update(attachment);
		}
	}
}
