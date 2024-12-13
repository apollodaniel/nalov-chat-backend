import { Not } from 'typeorm';
import { StaticServices } from '../static/static.services';
import { User } from './users.entity';
import { UserErrors } from './users.errors';
import { UserRepository } from './users.repository';
import { UserQuery } from './users.types';
import fs from 'fs';
import { join } from 'path';
import { FULLNAME_VALIDATION_REGEX } from '../shared/common.constants';
import { ErrorEntry } from '../shared/common.types';

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
	static async updateUser(
		boundary: string,
		userId: string,
	): Promise<{
		onData: (data: Uint8Array) => void;
		onError: () => number;
		onEnd: () => number;
	}> {
		let fileDir = join('./public/profile-pictures/');
		if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });

		const profilePictureFileStream = fs.createWriteStream(
			`public/profile-pictures/${userId}.png`,
			{
				flags: 'a',
			},
		);

		return {
			onData: async (data: Uint8Array) => {
				if (!profilePictureFileStream.closed) {
					await UsersServices.parseChunk(
						boundary,
						profilePictureFileStream,
						Buffer.from(data),
						userId,
					);
				}
			},
			onError: () => {
				profilePictureFileStream.once('drain', () =>
					profilePictureFileStream.end(),
				);
				return 500;
			},
			onEnd: () => {
				profilePictureFileStream.once('drain', () =>
					profilePictureFileStream.end(),
				);
				return 200;
			},
		};
	}

	static async parseChunk(
		boundary: string,
		filestream: fs.WriteStream,
		buffer: Buffer,
		userId: string,
	) {
		let bufferContent = Buffer.copyBytesFrom(buffer);
		let bufferStr = bufferContent.toString('binary');

		const boundaryMatches = Array.from(
			bufferStr.matchAll(new RegExp(`-*${boundary}-*`, 'g')),
		);
		let boundaryOcurrences = boundaryMatches.map((match) => match.index);

		const headerEndIndex =
			StaticServices.getChunkHeaderEndIndex(bufferContent);

		// write files
		if ((bufferStr.match(/name="profilePicture"/) || []).length > 0) {
			fs.writeFileSync(`public/profile-pictures/${userId}.png`, '');
			UsersServices.updateUserProfilePicture(userId);

			const end = boundaryOcurrences[1] || buffer.byteLength;

			const content = bufferContent.slice(headerEndIndex, end);
			filestream.write(content);
		} else {
			// raw file content
			filestream.write(
				buffer.slice(
					0,
					boundaryOcurrences[0]
						? boundaryOcurrences[0]
						: buffer.byteLength,
				),
			);
		}
	}

	static async updateName(userId: string, name: string) {
		// patch username
		await UserRepository.updateUser(userId, {
			name: name,
		});
	}

	static async updateUserProfilePicture(userId: string) {
		const builder = UserRepository.createQueryBuilder()
			.update({
				profilePicture: join(
					'public/profile-pictures',
					`${userId}.png`,
				),
			})
			.whereInIds(userId)
			.andWhere({
				profilePicture: 'default/profile-pictures/default.png',
			});

		await builder.execute();
	}
}
