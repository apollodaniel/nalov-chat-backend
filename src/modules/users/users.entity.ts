import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	PrimaryColumn,
	OneToOne,
} from 'typeorm';
import { Auth } from './Auth';

export interface IUser {
	id?: string;
	username: string;
	name: string;
	password: string;
	profile_picture?: string;
}

@Entity()
export class User {
	@PrimaryColumn('uuid')
	id: string;
	@Column()
	username: string;
	@Column()
	name: string;
	@Column()
	password: string;
	@Column()
	profile_picture: string = 'default/profile-pictures/default.png';
}
