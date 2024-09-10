import { v4 as gen_v4 } from "uuid";
import { IDbType } from "./types";

export interface IUser{
	id?: string;
	username: string;
	name: string;
	password: string;
	profile_picture?: string
}

export class User implements IDbType{
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
			this.profile_picture = '/public/profile-pictures/default.png';

		this.username = obj.username;
		this.name = obj.name;
		this.password = obj.password;


	}

	toInsert(): string{
		return `INSERT INTO users(id, username, name, password) values ('${this.id}', '${this.username}', '${this.name}', '${this.password}')`;
	}

	toDelete(): string {
		return '';
	}
}
