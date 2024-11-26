import { EntityRepository, Repository } from 'typeorm';
import { Auth } from '../entity/Auth';
import { User } from '../entity/User';
import { JwtHelper } from '../utils/jwtHelper';

@EntityRepository(Auth)
export class AuthRepository extends Repository<Auth> {
	async checkAuth(user: string | User): Promise<boolean> {
		return this.manager.exists(Auth, {
			where: {
				user_id: typeof user == 'string' ? user : user.id,
			},
		});
	}

	async checkAuthSession(token: string): Promise<boolean> {
		try {
			const refreshToken = JwtHelper.verify(token, 'Auth');

			if (typeof refreshToken != 'string') return false;

			return this.manager.exists(Auth, {
				where: {
					token: refreshToken,
				},
			});
		} catch (err: any) {
			return false;
		}
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
