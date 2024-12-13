import { User } from '../users/users.entity';
import { UserRepository } from '../users/users.repository';
import { Auth } from './auth.entity';
import { AuthErrors } from './auth.errors';
import { AuthRepository } from './auth.repository';
import { AuthCredentials } from './auth.types';

export class AuthServices {
	// login
	static async addAuth(credentials: Partial<AuthCredentials>): Promise<Auth> {
		const user = await AuthRepository.validateCredentials(credentials);

		return await AuthRepository.addAuth(user);
	}

	// logout
	static async removeAuth(user: string | User) {
		const authExists = AuthRepository.exists({
			where: {
				userId: typeof user == 'string' ? user : user.id,
			},
		});

		await AuthRepository.removeAuth(user);
	}

	// register
	static async addUser(user: Partial<User>) {
		const userExist = await UserRepository.exists({
			where: {
				username: user.username,
			},
		});
		if (userExist) throw AuthErrors.USERNAME_ALREADY_EXISTS;
		await UserRepository.addUser(user);
	}

	static async checkAuthSession(token: string) {
		const session = await AuthRepository.checkAuthSession(token);
	}

	static async refreshSession(token: string): Promise<string> {
		const result = await AuthRepository.refreshSession(token);

		return result;
	}
}
