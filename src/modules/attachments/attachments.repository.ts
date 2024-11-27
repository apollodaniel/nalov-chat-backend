import { EntityRepository, Repository } from 'typeorm';
import { Attachment } from '../entity/Attachment';

export class AttachmentRepository extends Repository<Attachment> {
	async getAttachments(): Promise<Attachment[]> {
		return this.createQueryBuilder().getMany();
	}
	async addAttachment(
		attachment: Partial<Attachment> | Partial<Attachment>[],
	): Promise<void> {
		await this.manager.save(attachment);
	}
}
