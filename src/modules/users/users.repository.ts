import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserCredentials, UserCredentialStatus } from '../types/types';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
	async addUser(user: Partial<User>): Promise<void> {
		await this.save(user);
	}
	async removeUser(user: User | string): Promise<void> {
		const user_id = typeof user == 'string' ? user : user.id;
		await this.createQueryBuilder().whereInIds(user_id).delete().execute();
	}
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
	}
	async searchUser(field: string, value: string): Promise<User[]> {
		return await this.createQueryBuilder()
			.where("$field like '%$value$%'", {
				field,
				value,
			})
			.getMany();
	}

	async validateCredentials(
		credentials: UserCredentials,
	): Promise<UserCredentialStatus> {
		const result = await this.find({
			where: [
				{
					name: credentials.username,
					password: credentials.password,
				},
				{
					name: credentials.username,
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
			return UserCredentialStatus.UsernameNotExists;
		else if (usernameMatch.password == credentials.password)
			return UserCredentialStatus.Sucess;

		return UserCredentialStatus.IncorrectPassword;
	}
}
