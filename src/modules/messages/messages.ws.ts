import { IncomingMessage } from 'http';
import { parse } from 'url';
import { WebSocket } from 'ws';

export default function handle_route(
	ws: WebSocket,
	request: IncomingMessage,
	user_id: string,
) {
	const query = parse(request.url!, true).query;
	const receiver_id = query.receiver_id;
	if (!receiver_id) {
		ws.send('receiver id must not be empty');
		return;
	}
	let listener = async (args: any) => {
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

	ws.on('close', () => {
		EVENT_EMITTER.off(
			`update-${get_users_chat_id(receiver_id.toString(), user_id)}`,
			listener,
		);
		console.log(`Closed message connection for ${user_id}`);
	});
}
