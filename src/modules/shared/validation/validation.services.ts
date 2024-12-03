import { AuthRepository } from '../../auth/auth.repository';

export class ValidationServices {
	static async checkValidation(authToken: string) {
		const isOk = await AuthRepository.checkAuthSession(authToken);

		if (typeof isOk != 'string') throw new Error(isOk);

		return isOk;
	}
}
