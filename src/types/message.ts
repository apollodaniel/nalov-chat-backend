import { v4 as gen_v4 } from "uuid";
import { IDbType, MessageUpdateParams } from "./types";
import { IUser } from "./user";

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
	date: number,
	sender_id: string,
	receiver_id: string
}

export class Message{
	id: string;
	content: string;
	date: number;
	sender_id: string;
	receiver_id: string;

	constructor(obj: IMessage){
		if(obj.id)
			this.id = obj.id;
		else
			this.id = gen_v4();
		this.date = obj.date;
		this.content = obj.content;
		this.sender_id = obj.sender_id;
		this.receiver_id = obj.receiver_id;
	}

	toInsert(): string{
		return `INSERT INTO messages(id, content, date, sender_id, receiver_id) values ('${this.id}', '${this.content}', ${this.date}, '${this.sender_id}', '${this.receiver_id}')`;
	}

	static toDelete(id: string): string{
		return `DELETE FROM messages WHERE id = '${id}'`;
	}

	static toUpdate({id,date,content}: MessageUpdateParams): string{
		if(!date && !content)
			return "";
		return `UPDATE FROM messages SET ${(date && `date = ${date}`)} ${(content && `content = '${content}'`)}  WHERE id = '${id}'`;
	}
}
