import { Auth } from '../../types/auth';
import { UserCredentials } from '../../types/types';
import { IUser, User } from '../../types/user';
import { error_map } from '../constants';
import { ChatAppDatabase } from '../db';
import jwt from 'jsonwebtoken';
import { glob } from 'glob';
import fs from 'fs';

export async function register_user(user: User) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(user.toInsert());
}

export async function login_user(auth: Auth) {
	const db = ChatAppDatabase.getInstance();
	try {
		// check for username existence
		await db.exec_db(auth.toInsert());
	} catch (err: any) {
		if (err.message !== error_map.user_already_logged_in.error_msg)
			throw err;
	}
}

export async function delete_user(user_id: string) {
	const iterator = glob.iterate(`./files/chats/*${user_id}*`);
	for await (const entry of iterator) {
		try {
			await fs.promises.rm(entry, {
				recursive: true,
				maxRetries: 3,
				retryDelay: 100,
				force: true,
			});
		} finally {
			console.log('Deleted entry ' + entry);
		}
	}

	const db = ChatAppDatabase.getInstance();
	await db.exec_db(User.toDelete(user_id));
}

export async function logout_user(refresh_token: string) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(`DELETE FROM auth WHERE token = '${refresh_token}'`);
}

export async function get_users(): Promise<User[]> {
	const db = ChatAppDatabase.getInstance();
	return ((await db.query_db('SELECT * FROM users')).rows as IUser[]).map(
		(e) => new User(e),
	) as User[];
}

export async function get_single_user(id: string): Promise<User> {
	const db = ChatAppDatabase.getInstance();
	const users = await db.query_db(`SELECT * FROM users WHERE id = '${id}'`);
	if (users.rowCount === 0) throw Error('not found');

	return new User(users.rows[0]);
}

export async function get_users_with_query({
	user_id,
	query,
	limit = 10,
}: {
	limit?: number;
	user_id: string;
	query: { field: string; search: any }[];
}): Promise<User[]> {
	const db = ChatAppDatabase.getInstance();
	let queries = [];

	for (const _query of query) {
		if (typeof _query.search === 'string') {
			queries.push(`${_query.field} like '%${_query.search}%'`);
			continue;
		}
		queries.push(`${_query.field} = ${_query.search}`);
	}

	const result = await db.query_db(
		`SELECT * FROM users WHERE id != '${user_id}'${queries.length > 0 ? ' and ' + queries.join(' and ') : ''} ORDER BY name limit ${limit}`,
	);

	return result.rows;
}

export async function check_user_credential_valid(
	credentials: UserCredentials,
): Promise<string | any[]> {
	const db = ChatAppDatabase.getInstance();

	let result_username = await db.query_db(
		`SELECT * FROM users WHERE username = '${credentials.username}' limit 1`,
	);
	let errors = [];

	if (result_username.rowCount === 0) {
		errors.push(error_map.username_not_exists.error_obj);
	} else {
		let result_pass = await db.query_db(
			`SELECT * FROM users WHERE password = '${credentials.password}' and username = '${credentials.username}' limit 1`,
		);

		if (result_pass.rowCount === 0) {
			errors.push(error_map.invalid_credentials.error_obj);
		}
	}

	if (errors.length === 0) {
		return result_username.rows[0].id!;
	}

	return errors;
}

export async function check_user_token_valid(
	token: string,
	type: 'refresh' | 'auth',
): Promise<boolean> {
	try {
		const result = jwt.verify(
			token,
			type == 'refresh'
				? process.env.JWT_REFRESH_TOKEN!
				: process.env.JWT_AUTH_TOKEN!,
		);
		const db = await ChatAppDatabase.getInstance().initDB();
		if (type === 'auth') {
			const query = await db.query(
				`SELECT * FROM auth WHERE token = '${result}' limit 1`,
			);
			return query.rowCount != 0;
		} else {
			const query = await db.query(
				`SELECT * FROM users WHERE id = '${result}' limit 1`,
			);
			return query.rowCount != 0;
		}
	} catch (err: any) {
		return false;
	}
}
