import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Auth {
	@PrimaryColumn()
	token: string;
	@Column('uuid')
	userId: string;

	@ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: User;
}
