import { Repository } from 'typeorm';
import { IChat } from '../../types/message';
import { Message } from '../messages/messages.entity';
import { User } from '../users/users.entity';

export class ChatRepository extends Repository<Message> {
	async getChats(user: User | string): Promise<IChat[]> {
		const user_id = typeof user == 'string' ? user : user.id;

		/*
		 *
		 * How it works
		 * This get's the last message sended or received for an user that interacted with current user
		 * it is done by using distinct function
		 *
		 * It also get's last message sended on that chat
		 * And get's the unseen message count
		 *
		 * I hope it works xD
		 * */
		return this.createQueryBuilder('message')
			.select([
				'DISTINCT ON (LEAST(message.sender_id, message.receiver_id), GREATEST(message.sender_id, message.receiver_id))',
				`CASE
                WHEN message.sender_id = :user_id THEN receiver
                ELSE sender
            END AS user`,
				'last_message',
				`(SELECT count(*)
						FROM messages subMessage WHERE subMessage.seen_date IS NULL AND subMessage.sender_id = user.id AND receiver_id = :user_id) as unseen_message_count`,
			])
			.innerJoin('message.sender', 'sender')
			.innerJoin('message.receiver', 'receiver')
			.where(':user_id IN (message.receiver_id, message.sender_id)', {
				user_id,
			})
			.orderBy('LEAST(message.sender_id, message.receiver_id)', 'ASC')
			.addOrderBy(
				'GREATEST(message.sender_id, message.receiver_id)',
				'ASC',
			)
			.addOrderBy('message.creation_date', 'DESC')
			.setParameters({ user_id })
			.getRawMany();
	}
}
