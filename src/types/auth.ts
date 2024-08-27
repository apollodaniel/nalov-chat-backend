import jwt from 'jsonwebtoken';
import { IDbType } from './types';

export interface IAuth{
	token?: string,
	user_id: string
}

export class Auth implements IDbType{
	token: string;
	user_id: string;

	constructor(obj: IAuth){
		if(obj.token)
			this.token = obj.token;
		else{
			this.token = jwt.sign(obj.user_id, process.env.JWT_REFRESH_TOKEN!);
		}
		this.user_id = obj.user_id;
	}

	generate_auth_token(): string {
		return jwt.sign({refresh_token: this.token}, process.env.JWT_AUTH_TOKEN!, {expiresIn: '15M'});
	}

	toInsert(): string{
		return `INSERT INTO auth(token, user_id) values ('${this.token}', '${this.user_id}')`;
	}

	toDelete(): string{
		return `DELETE FROM auth WHERE token = '${this.token}'`;
	}
}
