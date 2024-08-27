import { v4 as gen_v4 } from "uuid";
import { IDbType } from "./types";

export interface IMessage {
	id?: string,
	content: string,
	date: number,
	sender_id: string,
	receiver_id: string
}

export class Message implements IDbType{
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
		return '';
	}

	toDelete(): string{
		return '';
	}
}
