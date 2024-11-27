import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../messages/messages.entity';

export class Attachment {
	@PrimaryGeneratedColumn('uuid')
	id: string;
	@Column('uuid')
	messageId: string;
	@Column();
	filename: string;
	@Column();
	mimeType: string;
	@Column();
	path: string;
	@Column();
	previewPath: string;
	@Column();
	byteLenght: number;
	@Column('timestamp');
	date: number;

	@ManyToOne(()=>Message, (message)=>message.id, {onDelete: "CASCADE"})
	@JoinColumn({name: "messageId"})
	message: Message;
}
