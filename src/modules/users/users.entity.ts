import { Entity, Column, PrimaryColumn } from 'typeorm';

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
	@Column()
	username: string;
	@Column()
	name: string;
	@Column({ select: false })
	password: string;
	@Column({ default: 'default/profile-pictures/default.png' })
	profilePicture: string;
}
