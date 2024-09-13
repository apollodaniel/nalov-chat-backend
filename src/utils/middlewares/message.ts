import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";
import {
	create_message,
	delete_message,
	get_chats,
	get_single_message,
	patch_message,
} from "../functions/messages";
import { get_messages } from "../get_messages";
import { IChat, Message } from "../../types/message";
import { matchedData } from "express-validator";
import { EVENT_EMITTER } from "../constants";

export async function message_get_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth!;
	const sender_id = new Auth({ token: Auth.verify_auth_token(auth) }).user_id;
	const receiver_id: string =
		(typeof req.query.receiver_id === "string" && req.query.receiver_id) ||
		"";

	try {
		const messages = await get_messages(sender_id, receiver_id);
		return resp
			.status(200)
			.send({ user_id: sender_id, messages: messages });
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}


export async function message_listen_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {

	resp.setHeader("Content-Type", "text/event-stream");
	resp.setHeader("Connection", "Keep-Alive");
	resp.setHeader("Cache-Control", "no-cache");
	resp.flushHeaders();


	const auth = req.auth!;
	const sender_id = new Auth({ token: Auth.verify_auth_token(auth) }).user_id;
	const receiver_id: string =
		(typeof req.query.receiver_id === "string" && req.query.receiver_id) ||
		"";

	const listener = async ()=>{
		try {
			const messages = await get_messages(sender_id, receiver_id);
			return resp.write(`data: ${JSON.stringify({ user_id: sender_id, messages: messages })}\n\n`);
		} catch (err: any) {
			console.log(err.message);
			return resp.write("error: error while trying to receive messages\n");
		}
	};


	req.on("close", ()=>{
		console.log("Closing connection!");
		EVENT_EMITTER.removeListener('update-messages', listener);
		return resp.end();
	});

	EVENT_EMITTER.on("update-messages", listener);
}

export async function message_get_single_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth!;
	const user_id = new Auth({ token: Auth.verify_auth_token(auth) });
	const message_id: string = req.query.id as string;

	try {
		const message = await get_messages(user_id.user_id, message_id);
		return resp.status(200).send(message);
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}

export async function message_put_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth!;
	const user_id = new Auth({ token: Auth.verify_auth_token(auth) });
	const result = matchedData(req);
	try {
		const message = new Message({
			...req.body,
			sender_id: user_id.user_id,
		});
		await create_message(message);
		EVENT_EMITTER.emit("update-messages");
		return resp.sendStatus(204);
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}

export async function message_patch_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth!;
	const user_id = new Auth({ token: Auth.verify_auth_token(auth) });
	const message_id: string = req.params.id as string;

	try {
		await patch_message({ id: message_id, ...req.body });
		EVENT_EMITTER.emit("update-messages");
		return resp.sendStatus(200);
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}

export async function message_delete_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth!;
	const user_id = new Auth({ token: Auth.verify_auth_token(auth) });
	const message_id: string = req.params.id;

	if(!message_id)
		return resp.sendStatus(403);

	const message = await get_single_message(user_id.user_id, message_id);

	if(message.sender_id !== user_id.user_id)
		return resp.sendStatus(401);

	try {
		await delete_message(message_id);
		EVENT_EMITTER.emit("update-messages");
		return resp.sendStatus(200);
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}

export async function chats_get_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth!;
	const user_id = new Auth({ token: Auth.verify_auth_token(auth) }).user_id;
	try {
		const chats: IChat[] = await get_chats(user_id);
		return resp.status(200).send({ chats: chats });
	} catch (err: any) {
		console.log(err.message);
		return resp.sendStatus(500);
	}
}
