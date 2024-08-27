import { QueryResult } from "pg";
import { UserCredentials } from "../types/types";
import { ChatAppDatabase } from "./db";
import { IUser } from "../types/user";




export async function check_user_credential_valid(credentials: UserCredentials): Promise<string>{
	const db = ChatAppDatabase.getInstance();

	const result = await db.query_db(`SELECT * FROM users WHERE username = '${credentials.username}' and password = '${credentials.password}'`);
	if(result.rowCount && result.rowCount != 0){
		return result.rows[0].id!;
	}

	throw new Error("invalid user credentials");
}
