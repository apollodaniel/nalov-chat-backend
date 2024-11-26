import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Auth {
	@PrimaryColumn()
	token: string;
	@Column('uuid')
	user_id: string;

	@ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User;
}
