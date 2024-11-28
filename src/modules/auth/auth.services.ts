import { AppDataSource } from '../../data-source';
import { User } from '../users/users.entity';
import { UserRepository } from '../users/users.repository';
import { Auth } from './auth.entity';
import { AuthErrorCodes } from './auth.errors';
import { AuthRepository } from './auth.repository';
import { AuthCredentials } from './auth.types';

export class AuthServices {
	private static repo = AppDataSource.getRepository(Auth).extend(
		AuthRepository.prototype,
	);
	private static usersRepo = AppDataSource.getRepository(User).extend(
		UserRepository.prototype,
	);

	// login
	static async addAuth(credentials: Partial<AuthCredentials>): Promise<Auth> {
		const user = await this.repo.validateCredentials(credentials);
		if (!(user instanceof User)) throw new Error(user);

		return await this.repo.addAuth(user);
	}

	// logout
	static async removeAuth(user: string | User) {
		const authExists = this.repo.exists({
			where: {
				userId: typeof user == 'string' ? user : user.id,
			},
		});
		if (!authExists) throw new Error(AuthErrorCodes.AUTH_NOT_FOUND);

		await this.repo.removeAuth(user);
	}

	// register
	static async addUser(user: Partial<User>) {
		await this.usersRepo.addUser(user);
		const userExist = await this.usersRepo.exists({
			where: {
				id: user.id,
			},
		});
		if (!userExist) throw new Error(AuthErrorCodes.REGISTER_FAIL);
	}

	static async checkAuthSession(token: string) {
		const session = await this.repo.checkAuthSession(token);
		if (typeof session != 'string') throw new Error(session);
	}

	static async refreshSession(token: string): Promise<string> {
		const result = await this.repo.refreshSession(token);

		if (typeof result != 'string') throw new Error(result);

		return result;
	}
}
