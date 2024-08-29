import { QueryResult } from "pg";
import { IMessage, Message } from "../../types/message";
import { ChatAppDatabase } from "../db";
import { MessageUpdateParams } from "../../types/types";

export async function get_messages(
	sender_id: string,
	receiver_id: string,
): Promise<Message[]> {
	const db = ChatAppDatabase.getInstance();
	const messages: IMessage[] = (
		(await db.query_db(
			`SELECT * FROM messages WHERE (sender_id = '${sender_id}' AND receiver_id = '${receiver_id}') OR (sender_id = '${receiver_id}' AND receiver_id = '${sender_id}') ORDER BY date`,
		)) as QueryResult<IMessage>
	).rows;
	return messages.map((m) => new Message(m));
}

export async function get_chats(user_id: string): Promise<string[]> {
	const db = await ChatAppDatabase.getInstance().initDB();
	const chats: string[] = [...(await db.query(`SELECT DISTINCT ON (LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id)) CASE WHEN sender_id = '${user_id}' THEN receiver_id ELSE sender_id END AS chat_id FROM messages WHERE '${user_id}' IN (receiver_id, sender_id) ORDER BY LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id), date DESC`)).rows];
	return chats;
}

export async function get_single_message(
	user_id: string,
	message_id: string,
): Promise<Message[]> {
	const db = ChatAppDatabase.getInstance();
	const messages: IMessage[] = (
		(await db.query_db(
			`SELECT * FROM messages WHERE id = '${message_id}' AND (sender_id = '${user_id} OR receiver_id = '${user_id}')`,
		)) as QueryResult<IMessage>
	).rows;

	return messages.map((m) => new Message(m));
}

export async function create_message(message: Message) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(message.toInsert());
}

export async function patch_message(params: MessageUpdateParams) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(Message.toUpdate(params));
}

export async function delete_message(message_id: string) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(Message.toDelete(message_id));
}
