import { join } from 'path';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import { Auth } from '../../types/auth';
import { User } from '../../types/user';
import { ChatAppDatabase } from '../db';
import { header } from 'express-validator';
import { getChunkHeaderEndIndex } from './receive_file_middleware';
import { get_single_user, get_users } from '../functions/users';

export function user_patch_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	if (
		!req.headers['content-type'] ||
		!req.headers['content-type']?.startsWith('multipart/form-data')
	)
		return resp.sendStatus(400);

	const auth = req.auth!;
	const auth_obj = new Auth({ token: Auth.verify_auth_token(auth) });
	const user_id = auth_obj.user_id;

	let file_path = './public/profile-picture/';

	if (!fs.existsSync(file_path)) fs.mkdirSync(file_path);

	const boundary = req.headers['content-type']
		.split(';')[1]
		.replace('boundary=', '')
		.trim();

	let filename = `${user_id}.png`;

	let profilePictureFileStream = fs.createWriteStream(
		join(file_path, filename),
		{
			encoding: 'binary',
			flags: 'a',
		},
	);

	req.on('data', async (data: Uint8Array) => {
		let buffer = Buffer.from(data);

		await parseChunk(boundary, profilePictureFileStream, buffer, user_id);
	});

	req.on('error', () => {
		profilePictureFileStream.end();
		return resp.sendStatus(500);
	});
	req.on('end', () => {
		profilePictureFileStream.end();

		return resp.sendStatus(200);
	});
}

async function parseChunk(
	boundary: string,
	filestream: fs.WriteStream,
	buffer: Buffer,
	user_id: string,
) {
	const buffer_str = buffer.toString('binary');
	let buffer_content = Buffer.copyBytesFrom(buffer);

	const boundaryMatches = Array.from(
		buffer_str.matchAll(new RegExp(`-*${boundary}-*`, 'g')),
	);
	let matchedBoundaries = boundaryMatches.map((match) => match[0]);
	let boundaryOcurrences = boundaryMatches.map((match) => match.index);

	// check if this is name field
	const userNameMatch = buffer_str.match(/name="userName"/) || [];

	if (userNameMatch.length !== 0) {
		buffer_content = buffer.slice(boundaryOcurrences[1], buffer.byteLength);

		const name = buffer
			.slice(
				buffer_str.indexOf(userNameMatch[0]!) +
					userNameMatch[0]!.length,
				boundaryOcurrences[1]
					? boundaryOcurrences[1]
					: buffer.byteLength,
			)
			.toString('binary')
			.replace('\n', '')
			.replace('\r', '')
			.trim();
		patch_user_name(user_id, name);

		matchedBoundaries = matchedBoundaries.filter((i, _index) => _index > 0);
		boundaryOcurrences = boundaryOcurrences.filter(
			(i, _index) => _index > 0,
		);
	}

	const headerEndIndex = getChunkHeaderEndIndex(buffer_content);

	// write files
	if (headerEndIndex != -1) {
		fs.writeFileSync(filestream.path, '');
		patch_user_profile_picture(user_id);

		const end = boundaryOcurrences[1] || buffer.byteLength;

		const content = buffer_content.slice(headerEndIndex, end);
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

async function patch_user_name(user_id: string, name: string) {
	const db = ChatAppDatabase.getInstance();

	await db.exec_db(
		User.toPatch(user_id, {
			name: name,
		}),
	);
}

async function patch_user_profile_picture(user_id: string) {
	const db = ChatAppDatabase.getInstance();

	await db.exec_db(
		User.toPatch(user_id, {
			profile_picture: join(`public/profile-pictures`, `${user_id}.png`),
		}),
	);
}
