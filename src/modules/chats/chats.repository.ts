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
    LEAST("message"."senderId", "message"."receiverId"),
    GREATEST("message"."senderId", "message"."receiverId")
  )
	to_jsonb(
		CASE
			WHEN "message"."senderId" = $1 THEN "receiver"
			ELSE "sender"
		END
	) - 'password' AS "user",
	"message".id AS "lastMessage",
    (
      SELECT COUNT(*)::int
      FROM "message" "subMessage"
      WHERE "subMessage"."seenDate" IS NULL
        AND "subMessage"."senderId" =
          CASE
            WHEN "message"."senderId" = $1 THEN "message"."receiverId"
            ELSE "message"."senderId"
          END
        AND "subMessage"."receiverId" = $1
    ) AS "unseenMessageCount"
  FROM "message"
  INNER JOIN "user" "sender" ON "sender"."id" = "message"."senderId"
  INNER JOIN "user" "receiver" ON "receiver"."id" = "message"."receiverId"
  WHERE $1 IN ("message"."receiverId", "message"."senderId")
  ORDER BY
    LEAST("message"."senderId", "message"."receiverId") ASC,
    GREATEST("message"."senderId", "message"."receiverId") ASC,
    "message"."creationDate" DESC;
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
