import { EntityRepository, Repository } from 'typeorm';
import { Auth } from '../entity/Auth';
import { User } from '../entity/User';
import { JwtHelper } from '../utils/jwtHelper';

export class AuthRepository extends Repository<Auth> {
	async checkAuth(user: string | User): Promise<boolean> {
		return this.manager.exists(Auth, {
			where: {
				user_id: typeof user == 'string' ? user : user.id,
			},
		});
	}

	async getUserID(token: string, type: 'Auth' | 'Refresh'): Promise<string> {
		if (type == 'Auth') {
			const refreshToken = JwtHelper.verify(token, type);
			return JwtHelper.verify(refreshToken, 'Refresh');
		}

		return JwtHelper.verify(token, type);
	}

	async checkAuthSession(token: string): Promise<string | null> {
		const refreshToken = JwtHelper.verify(token, 'Auth');

		if (typeof refreshToken != 'string') return null;
		if (
			await this.exists({
				where: {
					token: refreshToken,
				},
			})
		) {
			return JwtHelper.verify(refreshToken, 'Refresh');
		}
		return null;
	}

	async addAuth(user: User) {
		const auth = this.create({
			user: user,
			token: JwtHelper.signRefreshToken(user.id),
		});

		await this.manager.save(auth);
	}

	async removeAuth(user: string | User) {
		const auth = this.manager.findOne(Auth, {
			where: {
				user_id: typeof user == 'string' ? user : user.id,
			},
		});
		this.manager.remove(auth);
	}
}
