import { Auth } from "../../types/auth";
import { UserCredentials } from "../../types/types";
import { IUser, User } from "../../types/user";
import { error_map } from "../constants";
import { ChatAppDatabase } from "../db";
import jwt from "jsonwebtoken";

export async function register_user(user: User) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(user.toInsert());
}

export async function login_user(auth: Auth) {
	const db = ChatAppDatabase.getInstance();
	try{
		await db.exec_db(auth.toInsert());
	}catch(err: any){
		if(err.message  !== error_map.user_already_logged_in.error_msg)
			throw(err);
	}
}

export async function logout_user(refresh_token: string){
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(`DELETE FROM auth WHERE token = '${refresh_token}'`);
}

export async function get_users(): Promise<User[]>{
	const db = ChatAppDatabase.getInstance();
	return ((await db.query_db("SELECT * FROM users")).rows as IUser[]).map((e)=>new User(e)) as User[];
}

export async function get_single_user(id: string): Promise<User>{
	const db = ChatAppDatabase.getInstance();
	const users = (await db.query_db(`SELECT * FROM users WHERE id = '${id}'`)).rows as IUser[];
	if(users.length === 0)
		throw Error("not found");

	return new User(users[0]);
}

export async function check_user_credential_valid(
	credentials: UserCredentials,
): Promise<string> {
	const db = ChatAppDatabase.getInstance();

	const result = await db.query_db(
		`SELECT * FROM users WHERE username = '${credentials.username}' AND password = '${credentials.password}'`,
	);
	if (result.rowCount && result.rowCount != 0) {
		return result.rows[0].id!;
	}

	throw new Error("invalid user credentials");
}

export async function check_user_token_valid(token: string, type: "refresh"|"auth"): Promise<boolean>{
	try{

		const result = jwt.verify(token, type == "refresh" ? process.env.JWT_REFRESH_TOKEN! : process.env.JWT_AUTH_TOKEN!);
		const db = await ChatAppDatabase.getInstance().initDB();
		if(type === "auth"){
			const query = await db.query(`SELECT * FROM auth WHERE token = '${result}'`);
			return query.rowCount != 0;
		}else{
			const query = await db.query(`SELECT * FROM users WHERE id = '${result}'`);
			return query.rowCount != 0;
		}
	}catch(err: any){
		return false;
	}
}
