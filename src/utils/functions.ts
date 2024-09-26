import { IAttachment } from "../types/message";


export function get_users_chat_id(user1: string, user2: string) {
	return Array.from([user1, user2]).sort().join("");
}

export function parse_attachments_to_insert(attachments_values: string[]){
	return `INSERT INTO attachments(id, message_id, filename, mime_type, path, preview_path, byte_length, date) values ${attachments_values.join(", ")}`
}
