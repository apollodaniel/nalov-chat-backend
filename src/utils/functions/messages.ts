import { QueryResult } from "pg";
import { IChat, IMessage, Message } from "../../types/message";
import { ChatAppDatabase } from "../db";
import { MessageUpdateParams } from "../../types/types";
import { IUser, User } from "../../types/user";

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
	return messages.map((m) => new Message(m));
}

export async function get_chats(user_id: string): Promise<IChat[]> {
	const db = await ChatAppDatabase.getInstance().initDB();
	const chats: {user_id: string, id: string}[] = [...(await db.query(`SELECT DISTINCT ON (LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id)) CASE WHEN sender_id = '${user_id}' THEN receiver_id ELSE sender_id END AS user_id, id FROM messages WHERE '${user_id}' IN (receiver_id, sender_id) ORDER BY LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id), creation_date DESC`)).rows];
	let chats_parsed: IChat[] = [];
	for(let chat of chats){
		const user = (await db.query(`SELECT * FROM users WHERE id = '${chat.user_id}'`));
		const message = (await db.query(`SELECT * FROM messages WHERE id = '${chat.id}'`));
		const chat_user = new User(user.rows[0]);
		if((user.rowCount||0) != 0 && (message.rowCount||0) != 0 ){
			chats_parsed.push({
				user: {...chat_user},
				last_message: message.rows[0]
			})
		}
	}

	return chats_parsed;
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

	return new Message({...messages[0]});
}

export async function create_message(message: Message) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(message.toInsert());
}

export async function patch_message(params: MessageUpdateParams) {
	const db = ChatAppDatabase.getInstance();
	console.log(Message.toUpdate(params));
	await db.exec_db(Message.toUpdate(params));
}

export async function delete_message(message_id: string) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(Message.toDelete(message_id));
}
