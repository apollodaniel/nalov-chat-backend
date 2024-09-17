import jwt from 'jsonwebtoken';
import { IDbType } from './types';

export type AuthArgs = {token: string, user_id?: string} | {user_id: string, token?: string};

type SignedAuthToken = {
	refresh_token: string
}

export class Auth implements IDbType{
	token: string;
	user_id: string;

	constructor(args: AuthArgs){
		const {token, user_id} = args;
		if(token){
			this.token = token;
			const id = jwt.verify(token, process.env.JWT_REFRESH_TOKEN!, {});
				if(typeof id !== "string")
				throw new Error("invalid token");
			this.user_id = id;
		}else{
			this.token = jwt.sign(user_id!, process.env.JWT_REFRESH_TOKEN!, {});
			this.user_id = user_id!;
		}
	}

	generate_auth_token(): string {
		return jwt.sign({refresh_token: this.token }, process.env.JWT_AUTH_TOKEN!, {expiresIn: '30M'});
	}

	static verify_auth_token(auth_token: string): string {
		const verified_token = jwt.verify(auth_token, process.env.JWT_AUTH_TOKEN!, {}) as SignedAuthToken;
		return verified_token.refresh_token;
	}

	toInsert(): string{
		return `INSERT INTO auth(token, user_id) values ('${this.token}', '${this.user_id}')`;
	}

	toDelete(): string{
		return `DELETE FROM auth WHERE token = '${this.token}'`;
	}
}
