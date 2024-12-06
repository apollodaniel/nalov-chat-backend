import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Attachment } from '../attachments/attachments.entity';

@Entity({
	orderBy: {
		creationDate: 'ASC',
	},
	name: 'messages',
})
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	content: string;

	@Column('bigint')
	creationDate: number;

	@Column('bigint')
	lastModifiedDate: number;

	@Column('uuid')
	senderId: string;

	@Column('uuid')
	receiverId: string;

	@Column('bigint', { nullable: true })
	seenDate: number | null;

	@ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'senderId' })
	sender: User;

	@ManyToOne(() => User, (user) => user.receivedMessages, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'receiverId' })
	receiver: User;

	@OneToMany(() => Attachment, (attachment) => attachment.message, {
		eager: true,
		cascade: true,
	})
	attachments: Attachment[];
}
