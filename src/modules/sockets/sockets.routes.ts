import { parse } from 'url';
import message_route from '../messages/messages.ws';
import chat_route from '../chats/chats.ws';
import http from 'http';
import { WebSocket } from 'ws';
import { JsonWebTokenError } from 'jsonwebtoken';

export function handle_routes(ws: WebSocket, request: http.IncomingMessage) {
	const { url } = request;

	if (!url) return;

	const query = parse(url!, true).query;
	const token = query.token;

	try {
		const verified_token = Auth.verify_auth_token((token || '').toString());
		const user_id = new Auth({ token: verified_token }).user_id;

		if (url!.startsWith('/api/messages/listen')) {
			message_route(ws, request, user_id);
		} else if (url!.startsWith('/api/chats/listen')) {
			chat_route(ws, request, user_id);
		} else {
			ws.close(1000, 'Path not handled');
		}

		ws.on('error', (err: any) => {
			console.log(err.message);
		});
	} catch (err: any) {
		if (
			err instanceof JsonWebTokenError &&
			err.message.toLowerCase().includes('malformed')
		) {
			ws.send('invalid token');
		} else if (
			err instanceof JsonWebTokenError &&
			err.message.toLowerCase().includes('malformed')
		) {
			ws.send('expired token');
		} else ws.close();
	}
}
