import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Attachment } from './Attachment';

@Entity()
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	content: string;
	@Column()
	creation_date: number;
	@Column()
	last_modified_date: number;
	@Column('uuid')
	sender_id: string;
	@Column('uuid')
	receiver_id: string;
	@Column()
	seen_date: number | null;

	@ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'sender_id' })
	sender: User;

	@ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'receiver_id' })
	receiver: User;

	@OneToMany(() => Attachment, (att) => att.message)
	attachments: Attachment[];
}
