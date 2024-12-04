import { parseChatId } from '../../utils/functions';
import { Message } from './messages.entity';
import { AppDataSource } from '../../data-source';
import { IsNull } from 'typeorm';

export const MessageRepository = AppDataSource.getRepository(Message).extend({
	async getMessages(chatId: string): Promise<Message[]> {
		const [user1, user2] = parseChatId(chatId);

		return this.find({
			where: [
				{
					senderId: user1,
					receiverId: user2,
				},
				{
					senderId: user2,
					receiverId: user1,
				},
			],
		});
	},

	async markMessagesAsSeen(
		query:
			| string[]
			| string
			| Message[]
			| Message
			| { senderId: string; receiverId: string },
	) {
		if (
			Array.isArray(query) ||
			typeof query === 'string' ||
			query instanceof Message
		) {
			let messageIds = [];
			if (Array.isArray(query)) {
				if (query.length === 0) return [];
				messageIds =
					typeof query[0] === 'string'
						? query
						: query.map((msg) => (msg as Message).id);
			} else {
				messageIds = [typeof query === 'string' ? query : query.id];
			}

			await this.createQueryBuilder()
				.update({
					seenDate: Date.now(),
				})
				.whereInIds(messageIds)
				.andWhere({
					seenDate: IsNull(),
				})
				.execute();
		} else {
			await this.createQueryBuilder()
				.update({
					seenDate: Date.now(),
				})
				.where({
					senderId: query.receiverId,
					receiverId: query.senderId,
				})
				.andWhere({
					// mark messages received from the user that did the request
					seenDate: IsNull(),
				})
				.execute();
		}
	},
	async getMessage(messageId: string): Promise<Message | null> {
		return this.findOne({
			where: {
				id: messageId,
			},
		});
	},
	async addMessage(message: Partial<Message>) {
		console.log(message);
		await this.save(message);
	},
	async updateMessage(messageId: string, message: Partial<Message>) {
		await this.update(messageId, message);
	},
	async removeMessage(messages: string | string[]) {
		await this.createQueryBuilder().delete().whereInIds(messages).execute();
	},
});
