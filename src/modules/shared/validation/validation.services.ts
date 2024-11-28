import { AppDataSource } from '../../../data-source';
import { Auth } from '../../auth/auth.entity';
import { AuthRepository } from '../../auth/auth.repository';

export class ValidationServices {
	private static authRepo = AppDataSource.getRepository(Auth).extend(
		AuthRepository.prototype,
	);
	static async checkValidation(authToken: string) {
		const isOk = await this.authRepo.checkAuthSession(authToken);

		if (typeof isOk != 'string') throw new Error(isOk);

		return isOk;
	}
}
