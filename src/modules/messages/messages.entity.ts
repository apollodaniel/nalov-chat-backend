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

@Entity()
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	content: string;
	@Column()
	creationDate: number;
	@Column()
	lastModifiedDate: number;
	@Column('uuid')
	senderId: string;
	@Column('uuid')
	receiverId: string;
	@Column()
	seenDate: number | null;

	@ManyToOne(() => User, (user: User) => user.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'senderId' })
	sender: User;

	@ManyToOne(() => User, (user: User) => user.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'receiverId' })
	receiver: User;

	@OneToMany(() => Attachment, (att: Attachment) => att.message)
	attachments: Attachment[];
}
