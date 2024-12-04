import { Request, Response } from 'express';
import { UsersServices } from './users.services';
import { User } from './users.entity';
import { UserQuery, UserQueryDefaults } from './users.types';
import { CommonUtils } from '../shared/common.utils';
import fs from 'fs';

export class UsersController {
	static async getUsers(req: Request, resp: Response) {
		let query: UserQuery = {
			...UserQueryDefaults,
		};

		query.asc = req.query.asc != 'false';
		query.orderBy = (req.query.order_by as string) || query.orderBy;
		query.limit = parseInt(req.query.limit as string) || query.limit;

		Object.entries(req.query).forEach((entry) => {
			const field = entry[0];
			const value = entry[1];
			if (Object.keys(User).includes(field.replace('_strict', ''))) {
				query.fieldQueries?.push({
					field: field.replace('_strict', ''),
					value: value as string,
					strict: field.includes('_strict'),
				});
			}
		});

		const users = await UsersServices.getUsers(query);

		return resp.status(200).send(users);
	}

	static async getUser(req: Request, resp: Response) {
		const userId =
			req.path == '/api/users/current' ? req.userId! : req.params['id'];

		try {
			const user = await UsersServices.getUser(userId);

			return resp.status(200).json(user);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}

	static async removeUser(req: Request, resp: Response) {
		const userId = req.userId;

		try {
			await UsersServices.removeUser(userId!);
			return resp.sendStatus(200);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}

	static async updateUser(req: Request, resp: Response) {
		const userId = req.userId;

		if (
			!req.headers['content-type'] ||
			!req.headers['content-type']?.startsWith('multipart/form-data')
		)
			return resp.sendStatus(400);

		const boundary = req.headers['content-type']
			.split(';')[1]
			.replace('boundary=', '')
			.trim();

		const { onData, onError, onEnd } = await UsersServices.updateUser(
			boundary,
			userId!,
		);
		req.on('data', onData);

		Promise.race([
			new Promise<number>((r) => {
				req.on('error', () => r(onError()));
			}),
			new Promise<number>((r) => {
				req.on('end', () => r(onEnd()));
			}),
			new Promise<number>((r) => {
				req.on('close', () => r(onEnd()));
			}),
		]).then((status) => {
			return resp.sendStatus(status);
		});
	}
}
