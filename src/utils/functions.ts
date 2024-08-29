import { QueryResult } from "pg";
import {
	MessagesQuery,
	MessageUpdateParams,
	UserCredentials,
} from "../types/types";
import { ChatAppDatabase } from "./db";
import { IUser, User } from "../types/user";
import { IMessage, Message } from "../types/message";
import { Auth } from "../types/auth";
import { error_map } from "./constants";

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

export async function register_user(user: User) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(user.toInsert());
}

export async function login_user(auth: Auth) {
	const db = ChatAppDatabase.getInstance();
	try{
		await db.exec_db(auth.toInsert());
	}catch(err: any){
		if(err.message  !== error_map.user_already_logged_in.error_msg)
			throw(err);
	}
}

export async function check_user_credential_valid(
	credentials: UserCredentials,
): Promise<string> {
	const db = ChatAppDatabase.getInstance();

	const result = await db.query_db(
		`SELECT * FROM users WHERE username = '${credentials.username}' AND password = '${credentials.password}'`,
	);
	if (result.rowCount && result.rowCount != 0) {
		return result.rows[0].id!;
	}

	throw new Error("invalid user credentials");
}
