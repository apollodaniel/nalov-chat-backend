import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";
import {
    check_message_permission,
	create_message,
	delete_message,
	get_attachments,
	get_chats,
	get_messages,
	get_single_message,
	patch_message,
} from "../functions/messages";
import { Attachment, IAttachment, IChat, Message } from "../../types/message";
import { body, matchedData } from "express-validator";
import { error_map, EVENT_EMITTER } from "../constants";
import EventEmitter2 from "eventemitter2";
import { v4 } from "uuid";

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


export async function message_get_attachments_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth!;
	const user_id = new Auth({ token: Auth.verify_auth_token(auth) }).user_id;
	const message_id = req.params.id;

	try {
		if(!(await check_message_permission(user_id, message_id)))
			return resp.sendStatus(401); // user that requested the resource is not allowed to read it

		const attachments = await get_attachments(message_id);

		return resp
			.status(200)
			.send(attachments);
	} catch (err: any) {
		console.log(err.message);
		if(err.message = error_map.db_not_found.error_msg)
			return resp.sendStatus(404);

		return resp.sendStatus(500);
	}
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
		if(err.message = error_map.db_not_found.error_msg)
			return resp.sendStatus(404);
		return resp.sendStatus(500);
	}
}


function receive_file_listener(message: Message, user_id: string){
	// if sucess clear delete message timeout
	// clearTimeout(timeout_id);
	EVENT_EMITTER.removeAllListeners(`*${message.id}*`);
	EVENT_EMITTER.emit(`update-${message.receiver_id}`, user_id);
}

export async function message_put_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	const auth = req.auth!;
	const user_id = new Auth({ token: Auth.verify_auth_token(auth) });

	try {
		const message = new Message({
			...req.body,
			sender_id: user_id.user_id,
		});

		if(req.body.attachments){
			// wait for message file for 10 seconds and if not receives delete message

			for(const attachment of (req.body.attachments || []) as IAttachment[]){
				const file_extension = attachment.filename.match(/\.[^.]+$/);

				const id = v4();
				message.attachments = [...message.attachments || [], new Attachment({
					...attachment,
					id: id,
					message_id: message.id,
					date: Date.now(),
					path: `files/${message.id}/${id}${file_extension && file_extension[0] || ""}`
				})];
			}
		}

		console.log(message);

		// creation_date and last_modified_date must have same value on creation
		if(message.creation_date != message.last_modified_date)
			message.last_modified_date = message.creation_date;

		await create_message(message);
		EVENT_EMITTER.emit(`update-${message.receiver_id}`, [user_id.user_id]);

		if(message.attachments && message.attachments.length > 0){
			// temporary solution to attachment.id - need to listen to all events of changed file, a generic event with message id
			// and the attachment id being the parameter
			EVENT_EMITTER.on(`received-file-${message.attachments![0].id}`, ()=> receive_file_listener(message, user_id.user_id));
			return resp.send({message_id: message.id});
		}

		return resp.send({message_id: message.id});
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

	const message = await get_single_message(user_id.user_id, message_id);

	try {
		await patch_message({ id: message_id, ...req.body });
		EVENT_EMITTER.emit(`update-${message.receiver_id}`, [user_id.user_id]);
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
		EVENT_EMITTER.emit(`update-${message.receiver_id}`, [user_id.user_id]);
		EVENT_EMITTER.removeAllListeners(`*${message_id}*`);
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

// listen middlewares => data stream
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

	const listener = async (opts: any)=>{
		if(opts[0] !== sender_id)
			return;
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
		EVENT_EMITTER.removeListener(`update-${receiver_id}`, listener);
		return resp.end();
	});

	EVENT_EMITTER.on(`update-${receiver_id}`, listener);
}

export async function chat_listen_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {

	resp.setHeader("Content-Type", "text/event-stream");
	resp.setHeader("Connection", "Keep-Alive");
	resp.setHeader("Cache-Control", "no-cache");
	resp.flushHeaders();


	const auth = req.auth!;
	const user_id = new Auth({ token: Auth.verify_auth_token(auth) }).user_id;

	const listener = async (props: any)=>{
		try {
			const chats = await get_chats(user_id);
			console.log("Received event " + `update-${user_id}`);
			return resp.write(`data: ${JSON.stringify(chats)}\n\n`);
		} catch (err: any) {
			console.log(err.message);
			return resp.write("error: error while trying to receive messages\n");
		}
	};


	req.on("close", ()=>{
		console.log("Closing connection!");
		EVENT_EMITTER.removeListener(`update-${user_id}`, listener);
		console.log("Removed listener");
		return resp.end();
	});

	EVENT_EMITTER.on(`update-${user_id}`, listener);
}
