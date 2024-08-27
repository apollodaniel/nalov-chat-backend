import { v4 as gen_v4 } from "uuid";
import { IDbType } from "./types";

export interface IUser{
	id?: string;
	username: string;
	name: string;
	password: string;
}

export class User implements IDbType{
	id: string;
	username: string;
	name: string;
	password: string;

	constructor(obj: IUser){
		if(obj.id)
			this.id = obj.id;
		else
			this.id = gen_v4();
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
