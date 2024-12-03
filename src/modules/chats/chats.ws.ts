import { IncomingMessage } from 'http';
import { parse } from 'url';
import { EVENT_EMITTER } from '../../utils/constants';
import { ChatsServices } from './chats.services';
import { Server, WebSocket, WebSocketServer } from 'ws';
import { CommonUtils } from '../shared/common.utils';
import { ErrorEntry } from '../shared/common.types';

export class ChatsWsController {
	static async handleRoute(
		ws: WebSocket,
		request: IncomingMessage,
		userId: string,
	) {
		let listener = async () => {
			try {
				const chats = await ChatsServices.getChats(userId);
				return ws.send(JSON.stringify(chats));
			} catch (err: any) {
				ws.close(err.statusCode + 4000, JSON.stringify(err));
			}
		};
		let event = '';
		EVENT_EMITTER.onAny((_event) => {
			if (
				_event.toString().startsWith('update-') &&
				_event.includes(userId)
			) {
				listener();
				event = _event.toString();
			}
		});
		ws.on('close', () => {
			EVENT_EMITTER.off(event, listener);
			console.log(`Closed message connection for ${userId}`);
		});
	}
}
