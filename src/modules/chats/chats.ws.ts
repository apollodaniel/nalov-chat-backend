import { IncomingMessage } from 'http';
import { parse } from 'url';

export default function handle_route(
	ws: WebSocket,
	request: IncomingMessage,
	user_id: string,
) {
	let listener = async () => {
		try {
			const chats = await get_chats(user_id);
			return ws.send(JSON.stringify(chats));
		} catch (err: any) {
			console.log(err.message);
		}
	};
	let event = '';
	EVENT_EMITTER.onAny((_event) => {
		if (
			_event.toString().startsWith('update-') &&
			_event.includes(user_id)
		) {
			listener();
			event = _event.toString();
		}
	});

	ws.on('close', () => {
		EVENT_EMITTER.off(event, listener);
		// EVENT_EMITTER.removeListener(`update-*${user_id}*`, listener);
		console.log(`Closed message connection for ${user_id}`);
	});
}
