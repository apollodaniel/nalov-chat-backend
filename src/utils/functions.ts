import { IAttachment } from "../types/message";


export function parse_attachments_to_insert(attachments_values: string[]){
	return `INSERT INTO attachments(id, message_id, filename, mime_type, path, byte_length, date) values ${attachments_values.join(", ")}`
}
