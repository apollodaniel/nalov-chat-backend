import { v4 as gen_v4 } from "uuid";
import { MessageUpdateParams } from "./types";

export interface IChat {
	user: {
		id: string;
		name: string;
		username: string;
		profile_picture: string;
	};
	last_message: IMessage;
	unseen_message_count: number;
}

export interface IMessage {
	id?: string;
	content: string;
	creation_date: number;
	last_modified_date: number;
	seen_date: number | null;
	sender_id: string;
	receiver_id: string;
	attachments?: Attachment[];
}

export class Message {
	id: string;
	content: string;
	creation_date: number;
	last_modified_date: number;
	sender_id: string;
	receiver_id: string;
	seen_date: number | null;

	// internal acess only
	attachments: Attachment[];

	constructor(obj: IMessage) {
		if (obj.id) this.id = obj.id;
		else this.id = gen_v4();
		this.creation_date = obj.creation_date;
		this.last_modified_date = obj.last_modified_date;
		this.content = obj.content;
		this.sender_id = obj.sender_id;
		this.receiver_id = obj.receiver_id;
		this.seen_date = obj.seen_date;
		this.attachments = obj.attachments || [];
	}

	toInsert(): string {
		return `INSERT INTO messages(id, content, creation_date, last_modified_date, sender_id, receiver_id) values ('${this.id}', '${this.content}', ${this.creation_date}, ${this.last_modified_date}, '${this.sender_id}', '${this.receiver_id}')`;
	}

	static toDelete(id: string): string {
		return `DELETE FROM messages WHERE id = '${id}'`;
	}

	static toUpdate({
		id,
		last_modified_date,
		content,
	}: MessageUpdateParams): string {
		let set_params = [];
		if (last_modified_date)
			set_params.push(`last_modified_date = ${last_modified_date}`);
		if (content) set_params.push(`content = '${content}'`);

		return `UPDATE messages SET ${set_params.join(", ")} WHERE id = '${id}'`;
	}
}

export interface IAttachment {
	id: string;
	message_id: string;
	filename: string;
	mime_type: string;
	path: string;
	byte_length: number;
	date: number;
}

export class Attachment {
	id: string;
	message_id: string;
	filename: string;
	mime_type: string;
	path: string;
	byte_length: number;
	date: number;

	constructor(obj: IAttachment) {
		this.id = obj.id;
		this.message_id = obj.message_id;
		this.filename = obj.filename;
		this.mime_type = obj.mime_type;
		this.path = obj.path;
		this.byte_length = obj.byte_length;
		this.date = obj.date;
	}

	toInsert(): string {
		return `INSERT INTO attachments(id, message_id, filename, mime_type, path, byte_length, date) values ('${this.id}','${this.message_id}', '${this.filename}', '${this.mime_type}', '${this.path}', ${this.byte_length}, ${this.date})`;
	}

	toInsertValues(): string {
		return `('${this.id}','${this.message_id}', '${this.filename}', '${this.mime_type}', '${this.path}', ${this.byte_length}, ${this.date})`;
	}

	toUpdateMimeType({mimeType}: {mimeType: string}): string{
		return `UPDATE attachments SET mime_type = '${mimeType}' WHERE id = '${this.id}'`;
	}

	static toDelete(id: string): string {
		return `DELETE FROM attachments WHERE id = '${id}'`;
	}
}
