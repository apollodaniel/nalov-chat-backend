import { parseChatId } from '../../utils/functions';
import { Message } from './messages.entity';
import { AppDataSource } from '../../data-source';

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
