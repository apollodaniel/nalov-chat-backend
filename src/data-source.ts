import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Auth } from './modules/auth/auth.entity';
import { Message } from './modules/messages/messages.entity';
import { Attachment } from './modules/attachments/attachments.entity';
import { User } from './modules/users/users.entity';

dotenv.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.POSTGRES_HOST,
	port: parseInt(process.env.POSTGRES_PORT || '5432'),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	synchronize: false,
	logging: false,
	entities: [
		Auth,
		Message,
		Attachment,
		User, // Handles both TS (dev) and JS (prod)
	],
	migrations: ['src/migrations/*.ts', 'migrations/*.js'], // Update path if needed
	subscribers: [],
	migrationsTableName: 'migrations',
});
