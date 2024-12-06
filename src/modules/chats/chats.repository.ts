import { Repository } from 'typeorm';
import { Message } from '../messages/messages.entity';
import { User } from '../users/users.entity';
import { AppDataSource } from '../../data-source';
import { MessageRepository } from '../messages/messages.repository';
import { IChat } from './chats.types';

export const ChatRepository = AppDataSource.getRepository(Message).extend({
	async getChats(user: User | string): Promise<IChat[]> {
		const userId = typeof user == 'string' ? user : user.id;

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

		const rawQuery = `
  SELECT DISTINCT ON (
    LEAST("messages"."senderId", "messages"."receiverId"),
    GREATEST("messages"."senderId", "messages"."receiverId")
  )
	to_jsonb(
		CASE
			WHEN "messages"."senderId" = $1 THEN "receiver"
			ELSE "sender"
		END
	) - 'password' AS "user",
	"messages".id AS "lastMessage",
    (
      SELECT COUNT(*)::int
      FROM "messages" "subMessage"
      WHERE "subMessage"."seenDate" IS NULL
        AND "subMessage"."senderId" =
          CASE
            WHEN "messages"."senderId" = $1 THEN "messages"."receiverId"
            ELSE "messages"."senderId"
          END
        AND "subMessage"."receiverId" = $1
    ) AS "unseenMessageCount"
  FROM "messages"
  INNER JOIN "users" "sender" ON "sender"."id" = "messages"."senderId"
  INNER JOIN "users" "receiver" ON "receiver"."id" = "messages"."receiverId"
  WHERE $1 IN ("messages"."receiverId", "messages"."senderId")
  ORDER BY
    LEAST("messages"."senderId", "messages"."receiverId") ASC,
    GREATEST("messages"."senderId", "messages"."receiverId") ASC,
    "messages"."creationDate" DESC;
    `;

		const result: any[] = await Promise.all(
			(await this.query(rawQuery, [userId])).map(async (i: any) => {
				const message = await MessageRepository.createQueryBuilder(
					'message',
				)
					.leftJoinAndSelect('message.attachments', 'attachments')
					.whereInIds(i.lastMessage)
					.getOne();
				return {
					...i,
					lastMessage: message,
				};
			}),
		);

		return result;
	},
});
