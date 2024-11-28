import { AppDataSource } from '../../data-source';
import { User } from './users.entity';
import { UserErrorCodes } from './users.errors';
import { UserRepository } from './users.repository';
import { UserQuery } from './users.types';

export class UsersServices {
	private static repo = AppDataSource.getRepository(User).extend(
		UserRepository.prototype,
	);
	static async getUsers(query?: UserQuery): Promise<User[]> {
		return await this.repo.getUsers(query);
	}
	static async getUser(userId: string): Promise<User> {
		const user = await this.repo.getUser(userId);
		if (!user) throw new Error(UserErrorCodes.USER_NOT_FOUND);

		return user;
	}
	static async removeUser(userId: string): Promise<void> {
		const userExists = await this.repo.exists({
			where: {
				id: userId,
			},
		});

		if (!userExists) throw new Error(UserErrorCodes.USER_NOT_FOUND);

		return await this.repo.removeUser(userId);
	}
	static async updateUser(userId: string, user: Partial<User>) {
		const userExists = await this.repo
			.createQueryBuilder()
			.whereInIds(userId)
			.getExists();
		if (!userExists) throw new Error(UserErrorCodes.USER_NOT_FOUND);
		await this.repo.updateUser(userId, user);
	}
}
