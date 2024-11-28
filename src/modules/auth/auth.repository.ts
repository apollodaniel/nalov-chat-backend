import { Repository } from 'typeorm';
import { Auth } from './auth.entity';
import { User } from '../users/users.entity';
import { JwtHelper } from '../../utils/jwtHelper';
import { AuthErrorCodes } from './auth.errors';
import { AppDataSource } from '../../data-source';
import { UserRepository } from '../users/users.repository';
import { AuthCredentials } from './auth.types';

export class AuthRepository extends Repository<Auth> {
	private usersRepo = AppDataSource.getRepository(User).extend(
		UserRepository.prototype,
	);
	async checkUserAuthorized(user: string | User): Promise<boolean> {
		return this.exists({
			where: {
				userId: typeof user == 'string' ? user : user.id,
			},
		});
	}

	async getUserID(
		token: string,
		type: 'Auth' | 'Refresh',
	): Promise<string | AuthErrorCodes> {
		if (!JwtHelper.checkValid(token, type)) {
			if (type == 'Auth') return AuthErrorCodes.EXPIRED_SESSION;
			const exists = await this.exists({
				where: {
					token: token,
				},
			});
			if (exists) {
				this.createQueryBuilder()
					.where({
						token: token,
					})
					.delete();
				return AuthErrorCodes.INVALID_TOKEN;
			}
			return AuthErrorCodes.NO_SESSION;
		}

		if (type == 'Auth') {
			const refreshToken = JwtHelper.verify(token, type);
			return JwtHelper.verify(
				refreshToken.toString(),
				'Refresh',
			).toString();
		}

		return JwtHelper.verify(token, type).toString();
	}

	async checkAuthSession(token: string): Promise<string | AuthErrorCodes> {
		if (!JwtHelper.checkValid(token, 'Auth'))
			return AuthErrorCodes.EXPIRED_SESSION;

		const refreshToken = JwtHelper.verify(token, 'Auth');

		if (typeof refreshToken != 'string')
			return AuthErrorCodes.EXPIRED_SESSION;
		if (
			await this.exists({
				where: {
					token: refreshToken,
				},
			})
		) {
			return JwtHelper.verify(refreshToken, 'Refresh').toString();
		}
		return AuthErrorCodes.NO_SESSION;
	}

	async refreshSession(token: string): Promise<string | AuthErrorCodes> {
		if (!JwtHelper.checkValid(token, 'Refresh')) {
			const exists = await this.exists({
				where: {
					token: token,
				},
			});

			if (exists) {
				this.createQueryBuilder()
					.where({
						token: token,
					})
					.delete();
				return AuthErrorCodes.INVALID_TOKEN;
			}
			return AuthErrorCodes.NO_SESSION;
		}

		return JwtHelper.signAuthToken(token);
	}

	async addAuth(user: string | Partial<User>): Promise<Auth> {
		const auth = this.create({
			userId: typeof user == 'string' ? user : user.id,
			token: JwtHelper.signRefreshToken(
				typeof user == 'string' ? user : user.id,
			),
		});

		await this.save(auth);
		return auth;
	}

	async removeAuth(user: string | User) {
		this.createQueryBuilder()
			.whereInIds(typeof user == 'string' ? user : user.id)
			.delete();
	}

	async validateCredentials(
		credentials: Partial<AuthCredentials>,
	): Promise<User | AuthErrorCodes> {
		const result = await this.usersRepo.find({
			where: [
				{
					username: credentials.username,
					password: credentials.password,
				},
				{
					username: credentials.username,
				},
				{
					password: credentials.password,
				},
			],
		});

		const usernameMatch = result.find(
			(res) => res.username == credentials.username,
		);
		if (result.length == 0 || !usernameMatch)
			return AuthErrorCodes.UNKNOWN_USERNAME;
		else if (usernameMatch.password == credentials.password)
			return usernameMatch;

		return AuthErrorCodes.INCORRECT_PASSWORD;
	}
}
