import { QueryResult } from 'pg';
import {
	Attachment,
	IAttachment,
	IChat,
	IMessage,
	Message,
} from '../../types/message';
import { ChatAppDatabase } from '../db';
import { MessageUpdateParams } from '../../types/types';
import { IUser, User } from '../../types/user';
import { parse_attachments_to_insert } from '../functions';
import { error_map } from '../constants';
import { parse } from 'dotenv';
import fs from 'fs';

export async function parse_message(message: IMessage) {
	const db = ChatAppDatabase.getInstance();
	const attachments: Attachment[] = (
		await db.query_db(
			`SELECT * FROM attachments WHERE message_id = '${message.id!}'`,
		)
	).rows.map((a) => new Attachment(a));

	return new Message({ ...message, attachments: attachments });
}

export async function get_messages(
	sender_id: string,
	receiver_id: string,
): Promise<Message[]> {
	const db = ChatAppDatabase.getInstance();
	const messages: IMessage[] = (
		(await db.query_db(
			`SELECT * FROM messages WHERE (sender_id = '${sender_id}' AND receiver_id = '${receiver_id}') OR (sender_id = '${receiver_id}' AND receiver_id = '${sender_id}') ORDER BY creation_date`,
		)) as QueryResult<IMessage>
	).rows;

	await db.exec_db(
		`UPDATE messages SET seen_date = ${Date.now()} WHERE seen_date IS NULL AND sender_id = '${receiver_id}' AND receiver_id = '${sender_id}'`,
	);

	const messages_obj = await Promise.all(
		messages
			.filter((msg) => (msg.attachments || []).every((a) => a.date))
			.map(async (msg) => await parse_message(msg)),
	);

	console.log(messages_obj[0]);

	return messages_obj;
}

export async function get_chats(user_id: string): Promise<IChat[]> {
	const db = await ChatAppDatabase.getInstance().initDB();
	const chats: { user_id: string; id: string }[] = [
		...(
			await db.query(
				`SELECT DISTINCT ON (LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id)) CASE WHEN sender_id = '${user_id}' THEN receiver_id ELSE sender_id END AS user_id, id FROM messages WHERE '${user_id}' IN (receiver_id, sender_id) ORDER BY LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id), creation_date DESC`,
			)
		).rows,
	];
	let chats_parsed: IChat[] = [];
	for (let chat of chats) {
		// user chat id
		const user = await db.query(
			`SELECT * FROM users WHERE id = '${chat.user_id}'`,
		);

		// get last message
		const messages = await db.query(
			`SELECT * FROM messages WHERE id = '${chat.id}'`,
		);

		// get unseen message count for receiver user being the user that made the request and sender_id the chat user id
		const unseen_count = await db.query(
			`SELECT count(*) FROM messages WHERE seen_date IS NULL AND sender_id = '${chat.user_id}' AND receiver_id = '${user_id}'`,
		);

		const chat_user = new User(user.rows[0]);
		if ((user.rowCount || 0) != 0 && (messages.rowCount || 0) != 0) {
			const attachments = await get_attachments(messages.rows[0].id);
			const message = {
				...(messages.rows[0] as IMessage),
				attachments: attachments,
			};
			chats_parsed.push({
				user: { ...chat_user },
				last_message: message,
				unseen_message_count:
					(unseen_count.rowCount === 0 && 0) ||
					unseen_count.rows[0]['count'],
			});
		}
	}

	return chats_parsed;
}
export async function check_message_permission(
	user_id: string,
	message_id: string,
) {
	const db = ChatAppDatabase.getInstance();
	const messages: IMessage[] = (
		(await db.query_db(
			`SELECT * FROM messages WHERE id = '${message_id}'`,
		)) as QueryResult<IMessage>
	).rows;
	if (messages.length === 0) throw new Error('message not found');
	return (
		messages[0].sender_id === user_id || messages[0].receiver_id === user_id
	);
}
export async function get_single_message(
	user_id: string,
	message_id: string,
): Promise<Message> {
	const db = ChatAppDatabase.getInstance();
	const messages: IMessage[] = (
		(await db.query_db(
			`SELECT * FROM messages WHERE id = '${message_id}' AND (sender_id = '${user_id}' OR receiver_id = '${user_id}')`,
		)) as QueryResult<IMessage>
	).rows;

	if (messages.length === 0)
		throw new Error(error_map.db_not_found.error_msg);
	return await parse_message(messages[0]);
}

export async function get_attachments(
	message_id: string,
): Promise<IAttachment[]> {
	const db = await ChatAppDatabase.getInstance().initDB();

	const query: QueryResult<IAttachment> = await db.query(
		`SELECT * FROM attachments WHERE message_id = '${message_id}'`,
	);

	return query.rows;
}
export async function update_attachment(query: string) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(query);
}

export async function create_message(message: Message) {
	const db = ChatAppDatabase.getInstance();
	if (message.attachments.length > 0) {
		await db.exec_db(new Message({ ...message }).toInsert());

		await db.exec_db(
			parse_attachments_to_insert(
				message.attachments.map((a) => a.toInsertValues()),
			),
		);
	} else {
		await db.exec_db(message.toInsert());
	}
}

export async function patch_message(params: MessageUpdateParams) {
	const db = ChatAppDatabase.getInstance();
	console.log(Message.toUpdate(params));
	await db.exec_db(Message.toUpdate(params));
}

export async function delete_message(user_id: string, message_id: string) {
	const db = ChatAppDatabase.getInstance();
	const message = await get_single_message(user_id, message_id);
	if (message.attachments.length > 0) {
		const path = message.attachments[0].path;
		let message_path = path.substring(0, path.lastIndexOf('/'));
		try {
			await fs.promises.rm(message_path, { recursive: true });
		} catch {}
	}
	await db.exec_db(Message.toDelete(message_id));
}
