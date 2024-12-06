import { Message } from '../messages/messages.entity';
import { User } from '../users/users.entity';

export interface IChat {
	user: Partial<User>;
	lastMessage: Partial<Message>;
	unseenMessageCount: number;
}
