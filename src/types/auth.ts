import jwt from 'jsonwebtoken';
import { IDbType } from './types';
import { ChatAppDatabase } from '../utils/db';

export type AuthArgs =
	| { token: string; user_id?: string }
	| { user_id: string; token?: string };

type SignedAuthToken = {
	refresh_token: string;
};

export class Auth implements IDbType {
	token: string;
	user_id: string;

	constructor(args: AuthArgs) {
		const { token, user_id } = args;
		if (token) {
			this.token = token;
			const id = jwt.verify(token, process.env.JWT_REFRESH_TOKEN!, {});
			if (typeof id !== 'string') throw new Error('invalid token');
			this.user_id = id;
		} else {
			this.token = jwt.sign(user_id!, process.env.JWT_REFRESH_TOKEN!, {});
			this.user_id = user_id!;
		}
	}

	generate_auth_token(): string {
		return jwt.sign(
			{ refresh_token: this.token },
			process.env.JWT_AUTH_TOKEN!,
			{ expiresIn: '5s' },
		);
	}

	static verify_auth_token(
		auth_token: string,
		ignore_expiration?: boolean,
	): string {
		const verified_token = jwt.verify(
			auth_token,
			process.env.JWT_AUTH_TOKEN!,
			{ ignoreExpiration: ignore_expiration || false },
		) as SignedAuthToken;
		return verified_token.refresh_token;
	}
	static async verify_refresh_token(token: string): Promise<boolean> {
		jwt.verify(token, process.env.JWT_REFRESH_TOKEN!, {});
		const db = ChatAppDatabase.getInstance();
		const result = await db.query_db(
			`SELECT * FROM auth WHERE token = '${token}' limit 1`,
		);
		return result.rowCount !== 0;
	}

	toInsert(): string {
		return `INSERT INTO auth(token, user_id) values ('${this.token}', '${this.user_id}')`;
	}

	toDelete(): string {
		return `DELETE FROM auth WHERE token = '${this.token}'`;
	}
}
