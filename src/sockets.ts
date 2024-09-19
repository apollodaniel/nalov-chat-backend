import http from "http";
import { EventEmitter, WebSocketServer } from "ws";
import { parse } from "url";
import { Auth } from "./types/auth";
import { get_chats, get_messages } from "./utils/functions/messages";
import { EVENT_EMITTER } from "./utils/constants";
import { JsonWebTokenError } from "jsonwebtoken";
import { get_users_chat_id } from "./utils/functions";

// Create an HTTP server
const server = http.createServer();

// Create a WebSocket server instance
const ws_server = new WebSocketServer({ server });

// Handle different paths
ws_server.on("connection", function connection(ws, request) {
	const { url } = request;

	if (!url) return;

	const query = parse(url!, true).query;
	const token = query.token;

	try {
		const verified_token = Auth.verify_auth_token((token || "").toString());
		const user_id = new Auth({ token: verified_token }).user_id;

		if (url!.startsWith("/api/messages/listen")) {
			const receiver_id = query.receiver_id;
			if (!receiver_id) {
				ws.send("receiver id must not be empty");
				return;
			}
			let listener = async () => {
				// must be receiver id on opt
				try {
					const messages = await get_messages(
						user_id,
						receiver_id.toString(),
					);
					return ws.send(JSON.stringify(messages));
				} catch (err: any) {
					console.log(err.message);
				}
			};

			EVENT_EMITTER.on(
				`update-${get_users_chat_id(receiver_id.toString(), user_id)}`,
				listener,
			);

			ws.on("close", () => {
				EVENT_EMITTER.off(
					`update-${get_users_chat_id(receiver_id.toString(), user_id)}`,
					listener,
				);
				console.log(`Closed message connection for ${user_id}`);
			});
		} else if (url!.startsWith("/api/chats/listen")) {
			let listener = async () => {
				try {
					const chats = await get_chats(user_id);
					return ws.send(JSON.stringify(chats));
				} catch (err: any) {
					console.log(err.message);
				}
			};
			let event = "";
			EVENT_EMITTER.onAny((_event) => {
				if (
					_event.toString().startsWith("update-") &&
					_event.includes(user_id)
				){

					listener();
					event = _event.toString();
				}
			});

			ws.on("close", () => {
				EVENT_EMITTER.off(event,listener);
				// EVENT_EMITTER.removeListener(`update-*${user_id}*`, listener);
				console.log(`Closed message connection for ${user_id}`);
			});
		} else {
			ws.close(1000, "Path not handled");
		}

		ws.on("error", (err: any) => {
			console.log(err.message);
		});
	} catch (err: any) {
		if (
			err instanceof JsonWebTokenError &&
			err.message.toLowerCase().includes("malformed")
		) {
			ws.send("invalid token");
		} else if (
			err instanceof JsonWebTokenError &&
			err.message.toLowerCase().includes("malformed")
		) {
			ws.send("expired token");
		} else ws.close();
	}
});

export default server;
