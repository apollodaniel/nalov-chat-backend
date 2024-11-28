import { Request, Response } from 'express';
import { UsersServices } from './users.services';
import { User } from './users.entity';
import { UserQuery, UserQueryDefaults } from './users.types';
import {
	UserErrorCodes,
	UserErrorMessages,
	UserErrorStatusCodes,
} from './users.errors';

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

		const users = UsersServices.getUsers(query);

		return resp.status(200).json(users);
	}

	static async getUser(req: Request, resp: Response) {
		const userId =
			req.path == '/api/users/current' ? req.userId! : req.params['id'];

		try {
			const user = await UsersServices.getUser(userId);

			return resp.status(200).json(user);
		} catch (err: any) {
			this.sendError(resp, err);
		}
	}

	static async removeUser(req: Request, resp: Response) {
		const userId = req.userId;

		try {
			await UsersServices.removeUser(userId!);
			return resp.sendStatus(200);
		} catch (err: any) {
			this.sendError(resp, err);
		}
	}

	static async updateUser(req: Request, resp: Response) {
		const userId = req.userId;
		const user: Partial<User> = req.body;

		try {
			await UsersServices.updateUser(userId!, user);
			return resp.sendStatus(200);
		} catch (err: any) {
			this.sendError(resp, err);
		}
	}

	private static sendError(resp: Response, err: any) {
		return resp
			.status(UserErrorStatusCodes[err.message as UserErrorCodes])
			.json({
				error: {
					kind: 'USERS',
					code: err.message,
					description:
						UserErrorMessages[err.message as UserErrorCodes],
				},
			});
	}
}
