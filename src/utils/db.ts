import pg, { QueryResult } from 'pg';
import { IMessage } from '../types/message';
import { IUser } from '../types/user';
import { CREATE_AUTH_TABLE, CREATE_MESSAGE_TABLE, CREATE_USER_TABLE } from './constants';

export class ChatAppDatabase{
	static _instance?: ChatAppDatabase;
	private db?: pg.Client;

	static getInstance(): ChatAppDatabase{
		if(!this._instance){
			this._instance = new ChatAppDatabase();
		}

		return this._instance;
	}

	constructor(){
		this.initDB().then((v)=>this.db = v);
	}

	async initDB(): Promise<pg.Client>{
		if(this.db){
			return this.db;
		}

		const db = new pg.Client({
			host: "127.0.0.1",
			port: (process.env.POSTGRES_PORT && parseInt(process.env.POSTGRES_PORT)) || undefined,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB
		});
		await db.connect();

		await db.query(CREATE_USER_TABLE);
		await db.query(CREATE_MESSAGE_TABLE);
		await db.query(CREATE_AUTH_TABLE);

		return db;
	}

	async query_db(query: string): Promise<QueryResult<IMessage | IUser>> {
		const db = await this.initDB();
		return await db.query(query);
	}

	async exec_db(sql: string): Promise<void> {
		const db = await this.initDB();
		await db.query(sql);
	}
}
