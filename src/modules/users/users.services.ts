import { Not } from 'typeorm';
import { StaticServices } from '../static/static.services';
import { User } from './users.entity';
import { UserErrors } from './users.errors';
import { UserRepository } from './users.repository';
import { UserQuery } from './users.types';
import fs from 'fs';
import { join } from 'path';

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
		console.log(fileDir);
		if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });

		const profilePictureFileStream = fs.createWriteStream(
			`public/profile-pictures/${userId}.png`,
			{
				flags: 'a',
			},
		);

		return {
			onData: async (data: Uint8Array) => {
				await UsersServices.parseChunk(
					boundary,
					profilePictureFileStream,
					Buffer.from(data),
					userId,
				);
			},
			onError: () => {
				profilePictureFileStream.end();
				return 500;
			},
			onEnd: () => {
				profilePictureFileStream.end();

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
		const bufferStr = buffer.toString('binary');
		let bufferContent = Buffer.copyBytesFrom(buffer);

		const boundaryMatches = Array.from(
			bufferStr.matchAll(new RegExp(`-*${boundary}-*`, 'g')),
		);
		let matchedBoundaries = boundaryMatches.map((match) => match[0]);
		let boundaryOcurrences = boundaryMatches.map((match) => match.index);

		// check if this is name field
		const userNameMatch = bufferStr.match(/name="userName"/) || [];

		let usernamePatched = false;
		if (userNameMatch.length !== 0) {
			usernamePatched = true;
			bufferContent = buffer.slice(
				boundaryOcurrences[1],
				buffer.byteLength,
			);

			const name = buffer
				.slice(
					bufferStr.indexOf(userNameMatch[0]!) +
						userNameMatch[0]!.length,
					boundaryOcurrences[1]
						? boundaryOcurrences[1]
						: buffer.byteLength,
				)
				.toString('binary')
				.replace('\n', '')
				.replace('\r', '')
				.trim();
			UsersServices.updateName(userId, name);

			matchedBoundaries = matchedBoundaries.filter(
				(i, _index) => _index > 0,
			);
			boundaryOcurrences = boundaryOcurrences.filter(
				(i, _index) => _index > 0,
			);
		}

		const headerEndIndex =
			StaticServices.getChunkHeaderEndIndex(bufferContent);
		const filenameMatch = bufferStr.match(/Content-Type: /) || [];

		// write files
		if (filenameMatch.length > 0) {
			fs.writeFileSync(`public/profile-pictures/${userId}.png`, '');
			UsersServices.updateUserProfilePicture(userId);

			const end = boundaryOcurrences[1] || buffer.byteLength;

			const content = bufferContent.slice(headerEndIndex, end);
			console.log('File start');
			filestream.write(content);
		} else if (!usernamePatched) {
			// raw file content
			console.log('File mid');
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
