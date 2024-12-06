import { AuthRepository } from '../auth/auth.repository';

export class SocketsServices {
	static async getUserId(token: string): Promise<string> {
		return await AuthRepository.getUserId(token, 'Auth');
	}
}
