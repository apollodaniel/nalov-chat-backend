import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Message } from '../messages/messages.entity';

export interface IUser {
	id?: string;
	username: string;
	name: string;
	password: string;
	profilePicture?: string;
}

@Entity()
export class User {
	@PrimaryColumn('uuid')
	id: string;
	@Column({
		unique: true,
	})
	username: string;
	@Column()
	name: string;
	@Column({ select: false })
	password: string;
	@Column({ default: 'default/profile-pictures/default.png' })
	profilePicture: string;

	@OneToMany(() => Message, (Message) => Message.senderId)
	sentMessages: Message;
	@OneToMany(() => Message, (Message) => Message.receiverId)
	receivedMessages: Message;
}
