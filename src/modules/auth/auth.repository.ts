import { Repository } from 'typeorm';
import { Auth } from './auth.entity';
import { User } from '../users/users.entity';
import { AuthErrors } from './auth.errors';
import { AppDataSource } from '../../data-source';
import { UserRepository } from '../users/users.repository';
import { AuthCredentials } from './auth.types';
import { JwtHelper } from '../shared/common.jwt';

const usersRepo = AppDataSource.getRepository(User);
export const AuthRepository = AppDataSource.getRepository(Auth).extend({
	async checkUserAuthorized(user: string | User): Promise<boolean> {
		return this.exists({
			where: {
				userId: typeof user == 'string' ? user : user.id,
			},
		});
	},

	async getUserId(token: string, type: 'Auth' | 'Refresh'): Promise<string> {
		if (!JwtHelper.checkValid(token, type)) {
			if (type == 'Auth') throw AuthErrors.EXPIRED_SESSION;
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
				throw AuthErrors.INVALID_TOKEN;
			}
			throw AuthErrors.NO_SESSION;
		}

		if (type == 'Auth') {
			const refreshToken = JwtHelper.verify(token, type);
			return JwtHelper.verify(
				refreshToken.payload.toString(),
				'Refresh',
			).toString();
		}

		return JwtHelper.verify(token, type).toString();
	},

	async checkAuthSession(token: string): Promise<string> {
		if (!JwtHelper.checkValid(token, 'Auth'))
			throw AuthErrors.EXPIRED_SESSION;

		const refreshToken = JwtHelper.verify(token, 'Auth').payload;

		if (typeof refreshToken != 'string') throw AuthErrors.EXPIRED_SESSION;
		if (
			await this.exists({
				where: {
					token: refreshToken,
				},
			})
		) {
			return JwtHelper.verify(refreshToken, 'Refresh').toString();
		}
		throw AuthErrors.NO_SESSION;
	},

	async refreshSession(token: string): Promise<string> {
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
				throw AuthErrors.INVALID_TOKEN;
			}
			throw AuthErrors.NO_SESSION;
		}

		return JwtHelper.signAuthToken(token);
	},

	async addAuth(credentials: Partial<AuthCredentials>): Promise<Auth> {
		const user = await this.validateCredentials(credentials);

		const auth = this.create({
			userId: user.id,
			token: JwtHelper.signRefreshToken(user.id),
		});

		await this.save(auth);
		return auth;
	},

	async removeAuth(user: string | User) {
		this.createQueryBuilder()
			.whereInIds(typeof user == 'string' ? user : user.id)
			.delete();
	},

	async validateCredentials(
		credentials: Partial<AuthCredentials>,
	): Promise<User> {
		const result = await usersRepo.find({
			select: ['username', 'password', 'id', 'name', 'profilePicture'],
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

		if (
			usernameMatch?.username == credentials.username &&
			usernameMatch?.password == credentials.password
		)
			return usernameMatch!;
		if (
			result.length == 0 ||
			usernameMatch?.username != credentials.username
		)
			throw AuthErrors.UNKNOWN_USERNAME;

		throw AuthErrors.INCORRECT_PASSWORD;
	},
});
