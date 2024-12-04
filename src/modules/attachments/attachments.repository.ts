import { Attachment } from './attachments.entity';
import { AppDataSource } from '../../data-source';

export const AttachmentRepository = AppDataSource.getRepository(
	Attachment,
).extend({
	async getAttachments(messageId: string): Promise<Attachment[]> {
		return this.createQueryBuilder()
			.where({
				messageId: messageId,
			})
			.getMany();
	},
	async addAttachment(
		attachment: Partial<Attachment> | Partial<Attachment>[],
	): Promise<void> {
		await this.manager.save(attachment);
	},

	async updateAttachment(
		attachmentId: string,
		attachment: Partial<Attachment>,
	) {
		this.createQueryBuilder()
			.whereInIds(attachmentId)
			.update(attachment)
			.execute();
	},
	async updateAttachments(
		attachments: {
			attachmentId: string;
			attachment: Partial<Attachment>;
		}[],
	) {
		for (const { attachmentId, attachment } of attachments) {
			await this.createQueryBuilder()
				.whereInIds(attachmentId)
				.update(attachment)
				.execute();
		}
	},
});
