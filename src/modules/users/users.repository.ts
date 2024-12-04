import { Like } from 'typeorm';
import { UserQuery } from './users.types';
import { User } from './users.entity';
import { AppDataSource } from '../../data-source';

export const UserRepository = AppDataSource.getRepository(User).extend({
	async addUser(user: Partial<User>): Promise<void> {
		await this.save(user);
	},
	async updateUser(userId: string, user: Partial<User>): Promise<void> {
		await this.update(userId, user);
	},
	async removeUser(user: User | string): Promise<void> {
		const userId = typeof user == 'string' ? user : user.id;
		await this.delete(userId);
	},
	async getUser(
		user: User | User[] | string | string[],
	): Promise<User | User[] | null> {
		if (user instanceof User || typeof user == 'string') {
			const user_id = typeof user == 'string' ? user : user.id;
			return await this.createQueryBuilder().whereInIds(user_id).getOne();
		}

		if (user.length == 0) {
			return [];
		}

		const user_ids = user.map((_user) =>
			typeof _user == 'string' ? _user : _user.id,
		);
		return await this.createQueryBuilder().whereInIds(user_ids).getMany();
	},

	async getUsers(query?: UserQuery) {
		if (!query) {
			return await this.find();
		}

		let builder = this.createQueryBuilder();

		let isFirst = true;
		for (let { field, value, strict } of query.fieldQueries) {
			if (isFirst) {
				isFirst = false;
				builder = builder.where({
					[field]: strict ? value : Like(value),
				});
			} else {
				builder = builder.andWhere({
					[field]: strict ? value : Like(value),
				});
			}
		}

		return await builder.getMany();
	},
});
