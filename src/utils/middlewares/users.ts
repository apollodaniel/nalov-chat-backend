import { NextFunction, Request, Response } from 'express';
import {
	delete_user,
	get_single_user,
	get_users,
	get_users_with_query,
} from '../functions/users';
import { IUser, User } from '../../types/user';
import { Auth } from '../../types/auth';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ChatAppDatabase } from '../db';

export async function users_get_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const { filter_field, filter_value } = req.query;

	// filter field depends on filter value and vice-versa
	if ((filter_field && !filter_value) || (filter_value && !filter_field))
		return resp.sendStatus(400);

	try {
		const current_user_id = new Auth({
			token: Auth.verify_auth_token(req.auth!),
		}).user_id;
		const users = (
			await get_users_with_query({
				user_id: current_user_id,
				query:
					filter_field && filter_value
						? [
								{
									field: filter_field as string,
									search: filter_value,
								},
							]
						: [],
				limit: 6,
			})
		)
			.filter((u: IUser) => current_user_id != u.id!)
			.map((u: IUser) => {
				return {
					...u,
					profile_picture: u.profile_picture
						? u.profile_picture
						: 'public/profile-pictures/default.png',
					password: undefined,
				};
			});
		return resp.status(200).send(users);
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}

export async function users_get_single_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const user_id = req.params.id!;
	try {
		const user = await get_single_user(user_id);
		return resp.status(200).send({
			...user,
			password: undefined,
		});
	} catch (err: any) {
		console.log(err.message);
		if (err.message == 'not found') return resp.sendStatus(404);
		return resp.sendStatus(500);
	}
}

export async function get_current_user_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth;

	try {
		const auth_obj = new Auth({ token: Auth.verify_auth_token(auth) });
		const user = await get_single_user(auth_obj.user_id);
		return resp.send({ ...user, password: undefined });
	} catch (err: any) {
		if (err instanceof JsonWebTokenError) {
			return resp.sendStatus(401);
		}

		return resp.sendStatus(500);
	}
}

export async function users_patch_single_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth;

	try {
		const auth_obj = new Auth({ token: Auth.verify_auth_token(auth) });

		console.log(req.body);

		if (req.query.name) {
			const db = ChatAppDatabase.getInstance();
			await db.exec_db(
				User.toPatch(auth_obj.user_id, {
					name: req.body.name as string,
				}),
			);
		}

		next();
	} catch (err: any) {
		console.log(err.message);
		if (err instanceof JsonWebTokenError) {
			return resp.sendStatus(401);
		}

		return resp.sendStatus(500);
	}
}

export async function delete_user_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth_token = req.auth;
	const auth = new Auth({ token: Auth.verify_auth_token(auth_token) });

	try {
		await delete_user(auth.user_id);
		return resp.sendStatus(200);
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}
