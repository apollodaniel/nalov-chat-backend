import { v4 as gen_v4 } from "uuid";
import { IDbType } from "./types";

export interface IUser{
	id?: string;
	username: string;
	name: string;
	password: string;
	profile_picture?: string
}

export class User{
	id: string;
	username: string;
	name: string;
	password: string;
	profile_picture: string;

	constructor(obj: IUser){
		if(obj.id)
			this.id = obj.id;
		else
			this.id = gen_v4();
		if(obj.profile_picture)
			this.profile_picture = obj.profile_picture;
		else
			this.profile_picture = 'public/profile-pictures/default.png';

		this.username = obj.username;
		this.name = obj.name;
		this.password = obj.password;


	}

	toInsert(): string{
		return `INSERT INTO users(id, username, name, password) values ('${this.id}', '${this.username}', '${this.name}', '${this.password}')`;
	}

	static toDelete(id: string): string {
		return `DELETE FROM users WHERE id = '${id}'`;
	}
	static toPatch(id: string, obj:{name?: string, profile_picture?: string}): string {
		let update_text = [];

		if(!obj.name && !obj.profile_picture)
			return '';

		if(obj.name)
			update_text.push(`name = '${obj.name}'`);
		if(obj.profile_picture)
			update_text.push(`profile_picture = '${obj.profile_picture}'`);

		return `UPDATE users SET ${update_text.join(", ")} WHERE id = '${id}'`;
	}
}
