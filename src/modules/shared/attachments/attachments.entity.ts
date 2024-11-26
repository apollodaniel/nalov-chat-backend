import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './Message';

export class Attachment {
	@PrimaryGeneratedColumn('uuid')
	id: string;
	@Column('uuid')
	message_id: string;
	@Column();
	filename: string;
	@Column();
	mime_type: string;
	@Column();
	path: string;
	@Column();
	preview_path: string;
	@Column();
	byte_length: number;
	@Column('timestamp');
	date: number;

	@ManyToOne(()=>Message, (message)=>message.id, {onDelete: "CASCADE"})
	@JoinColumn({name: "message_id"})
	message: Message;
}
