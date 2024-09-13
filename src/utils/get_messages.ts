import { QueryResult } from "pg";
import { Message, IMessage } from "../types/message";
import { ChatAppDatabase } from "./db";


export async function get_messages(
	sender_id: string,
	receiver_id: string
): Promise<Message[]> {
	const db = ChatAppDatabase.getInstance();
	const messages: IMessage[] = (
		(await db.query_db(
			`SELECT * FROM messages WHERE (sender_id = '${sender_id}' AND receiver_id = '${receiver_id}') OR (sender_id = '${receiver_id}' AND receiver_id = '${sender_id}') ORDER BY creation_date`
		)) as QueryResult<IMessage>
	).rows;
	return messages.map((m) => new Message(m));
}

