import { IAttachment } from '../types/message';

export function getChatId(user1: string, user2: string) {
	return Array.from([user1, user2]).sort().join('');
}
export function parseChatId(chatId: string): string[] {
	return chatId.split('|');
}
export function parse_attachments_to_insert(attachments_values: string[]) {
	return `INSERT INTO attachments(id, message_id, filename, mime_type, path, byte_length) values ${attachments_values.join(', ')}`;
}
