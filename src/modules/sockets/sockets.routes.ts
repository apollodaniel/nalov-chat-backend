import { parse } from 'url';
import { MessagesWsController } from '../messages/messages.ws';
import { ChatsWsController } from '../chats/chats.ws';
import http from 'http';
import { WebSocket } from 'ws';
import { SocketsServices } from './sockets.services';
import { ErrorEntry } from '../shared/common.types';
import { JwtHelper } from '../../utils/jwtHelper';

export class SocketController {
	static async handleRoutes(ws: WebSocket, request: http.IncomingMessage) {
		const { url } = request;

		if (!url) return;

		const query = parse(url!, true).query;
		const token: string = query.token as string;

		if (!JwtHelper.checkValid(token, 'Auth')) {
			return ws.close(601);
		}

		try {
			const userId = await SocketsServices.getUserId(token);

			if (url!.startsWith('/api/messages/listen')) {
				MessagesWsController.handleRoute(ws, request, userId);
			} else if (url!.startsWith('/api/chats/listen')) {
				ChatsWsController.handleRoute(ws, request, userId);
			} else {
				ws.close(4404);
			}

			ws.on('error', (err: any) => {
				console.log(err.message);
			});
		} catch (err: any) {
			console.log(err.message);
			ws.close(err.statusCode + 4000, JSON.stringify(err));
		}
	}

	static sendError(ws: WebSocket, err: ErrorEntry) {
		ws.close(err.statusCode, JSON.stringify(err));
	}
}
