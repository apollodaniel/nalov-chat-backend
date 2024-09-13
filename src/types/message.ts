import { v4 as gen_v4 } from "uuid";
import { MessageUpdateParams } from "./types";

export interface IChat {
	user: {
		id: string,
		name: string,
		username: string,
		profile_picture: string
	},
	last_message: IMessage,
}

export interface IMessage {
	id?: string,
	content: string,
	creation_date: number,
	last_modified_date: number,
	sender_id: string,
	receiver_id: string
}

export class Message{
	id: string;
	content: string;
	creation_date: number;
	last_modified_date: number;
	sender_id: string;
	receiver_id: string;

	constructor(obj: IMessage){
		if(obj.id)
			this.id = obj.id;
		else
			this.id = gen_v4();
		this.creation_date= obj.creation_date;
		this.last_modified_date= obj.last_modified_date;
		this.content = obj.content;
		this.sender_id = obj.sender_id;
		this.receiver_id = obj.receiver_id;
	}

	toInsert(): string{
		return `INSERT INTO messages(id, content, creation_date, last_modified_date, sender_id, receiver_id) values ('${this.id}', '${this.content}', ${this.creation_date}, ${this.last_modified_date}, '${this.sender_id}', '${this.receiver_id}')`;
	}

	static toDelete(id: string): string{
		return `DELETE FROM messages WHERE id = '${id}'`;
	}

	static toUpdate({id,last_modified_date,content}: MessageUpdateParams): string{
		let set_params = [];
		if(last_modified_date)
			set_params.push(`last_modified_date = ${last_modified_date}`)
		if(content)
			set_params.push(`content = '${content}'`)

		return `UPDATE messages SET ${set_params.join(", ")} WHERE id = '${id}'`;
	}
}
