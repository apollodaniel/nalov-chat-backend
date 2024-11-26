import { EntityRepository, Repository } from 'typeorm';
import { Message } from '../entity/Message';
import { parseChatId } from '../utils/functions';

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
	async getMessages(chatId: string): Promise<Message[]> {
		const [user1, user2] = parseChatId(chatId);

		return this.createQueryBuilder()
			.where(Message, {
				sender_id: user1,
				receiver_id: user2,
			})
			.orWhere(Message, {
				sender_id: user1,
				receiver_id: user2,
			})
			.getMany();
	}
	async getMessage(messageId: string): Promise<Message | null> {
		return this.manager.findOne(Message, {
			where: {
				id: messageId,
			},
		});
	}
	async addMessage(message: Partial<Message>) {
		await this.manager.save(message);
	}
	async removeMessage(messages: string | string[]) {
		if (typeof messages == 'string') {
			await this.manager.remove(messages);
		} else {
			await this.createQueryBuilder()
				.delete()
				.whereInIds(messages)
				.execute();
		}
	}
}
