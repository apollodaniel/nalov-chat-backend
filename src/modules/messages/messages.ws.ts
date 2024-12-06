import { IncomingMessage } from 'http';
import { parse } from 'url';
import { WebSocket } from 'ws';
import { MessageServices } from './messages.services';
import { EVENT_EMITTER } from '../shared/common.constants';
import { CommonUtils } from '../shared/common.utils';

export class MessagesWsController {
	static async handleRoute(
		ws: WebSocket,
		request: IncomingMessage,
		userId: string,
	) {
		const query = parse(request.url!, true).query;
		const receiverId = query.receiverId?.toString();

		if (!receiverId) {
			ws.close(4400, 'receiver id must not be empty');
			return;
		}
		let listener = async (args: any) => {
			// must be receiver id on opt
			try {
				const messages = await MessageServices.getMessages([
					userId,
					receiverId,
				]);
				return ws.send(JSON.stringify(messages));
			} catch (err: any) {
				ws.close(err.statusCode + 4000, JSON.stringify(err));
			}
		};

		console.log(
			'Connected to ' + CommonUtils.getChatId(userId, receiverId),
		);
		EVENT_EMITTER.on(
			`update-${CommonUtils.getChatId(receiverId, userId)}`,
			listener,
		);

		ws.on('close', () => {
			EVENT_EMITTER.off(
				`update-${CommonUtils.getChatId(receiverId, userId)}`,
				listener,
			);
			console.log(`Closed message connection for ${userId}`);
		});
	}
}
