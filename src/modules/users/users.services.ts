import { User } from './users.entity';
import { UserErrors } from './users.errors';
import { UserRepository } from './users.repository';
import { UserQuery } from './users.types';

export class UsersServices {
	static async getUsers(query?: UserQuery): Promise<User[]> {
		return await UserRepository.getUsers(query);
	}
	static async getUser(userId: string | string[]): Promise<User | User[]> {
		const user = await UserRepository.getUser(userId);
		if (!user) throw UserErrors.USER_NOT_FOUND;

		return user;
	}
	static async removeUser(userId: string): Promise<void> {
		const userExists = await UserRepository.exists({
			where: {
				id: userId,
			},
		});

		if (!userExists) throw UserErrors.USER_NOT_FOUND;

		return await UserRepository.removeUser(userId);
	}
	static async updateUser(userId: string, user: Partial<User>) {
		const userExists = await UserRepository.createQueryBuilder()
			.whereInIds(userId)
			.getExists();
		if (!userExists) throw UserErrors.USER_NOT_FOUND;
		await UserRepository.updateUser(userId, user);
	}
}
