import { QueryResult } from "pg";
import { Attachment, IAttachment, IChat, IMessage, Message } from "../../types/message";
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

	console.log(`UPDATE messages SET seen_date = ${Date.now()} WHERE seen_date IS NULL AND sender_id = '${receiver_id}' AND receiver_id = '${sender_id}'`)

	await db.exec_db(`UPDATE messages SET seen_date = ${Date.now()} WHERE seen_date IS NULL AND sender_id = '${receiver_id}' AND receiver_id = '${sender_id}'`);

	return messages.map((m) => new Message(m));
}

export async function get_chats(user_id: string): Promise<IChat[]> {
	const db = await ChatAppDatabase.getInstance().initDB();
	const chats: {user_id: string, id: string}[] = [...(await db.query(`SELECT DISTINCT ON (LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id)) CASE WHEN sender_id = '${user_id}' THEN receiver_id ELSE sender_id END AS user_id, id FROM messages WHERE '${user_id}' IN (receiver_id, sender_id) ORDER BY LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id), creation_date DESC`)).rows];
	let chats_parsed: IChat[] = [];
	for(let chat of chats){
		// user chat id
		const user = (await db.query(`SELECT * FROM users WHERE id = '${chat.user_id}'`));

		// get last message
		const message = (await db.query(`SELECT * FROM messages WHERE id = '${chat.id}'`));

		// get unseen message count for receiver user being the user that made the request and sender_id the chat user id
		const unseen_count = await db.query(`SELECT count(*) FROM messages WHERE seen_date IS NULL AND sender_id = '${chat.user_id}' AND receiver_id = '${user_id}'`);

		const chat_user = new User(user.rows[0]);
		if((user.rowCount||0) != 0 && (message.rowCount||0) != 0 ){
			chats_parsed.push({
				user: {...chat_user},
				last_message: message.rows[0],
				unseen_message_count: unseen_count.rowCount === 0 && 0 || unseen_count.rows[0]["count"]
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

export async function get_attachment(attachment_id: string): Promise<IAttachment>{
	const db = await ChatAppDatabase.getInstance().initDB();

	const query: QueryResult<IAttachment> = (await db.query(`SELECT * FROM attachments WHERE id = '${attachment_id}'`));
	if(query.rowCount === 0)
		throw Error("unknown attachment "+ `SELECT * FROM attachments WHERE id = '${attachment_id}'`);

	return query.rows[0];
}

export async function create_message(message: Message) {
	const db = ChatAppDatabase.getInstance();

	if(message.attachment){
		await db.exec_db(message.attachment.toInsert());

		await db.exec_db(new Message({...message, attachment: undefined, attachment_id: message.attachment.id}).toInsert());
	}else {

		await db.exec_db(message.toInsert());
	}

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
