import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from '../messages/messages.entity';

@Entity({
	name: 'attachments',
})
export class Attachment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column('uuid')
	messageId: string;

	@Column()
	filename: string;

	@Column()
	mimeType: string;

	@Column()
	path: string;

	@Column({ nullable: true })
	previewPath: string;

	@Column()
	byteLength: number;

	@Column('bigint')
	date: number;

	@ManyToOne(() => Message, (message) => message.attachments, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'messageId' })
	message: Message;
}
