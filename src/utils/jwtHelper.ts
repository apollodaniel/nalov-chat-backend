import jwt, { JwtPayload } from 'jsonwebtoken';

export class JwtHelper {
	static verify(
		token: string,
		type: 'Refresh' | 'Auth',
	): string | JwtPayload {
		return jwt.verify(
			token,
			type == 'Refresh'
				? process.env.JWT_REFRESH_TOKEN!
				: process.env.JWT_AUTH_TOKEN!,
			{},
		);
	}
	static checkValid(payload: any, type: 'Refresh' | 'Auth'): boolean {
		try {
			jwt.verify(
				payload,
				type == 'Refresh'
					? process.env.JWT_REFRESH_TOKEN!
					: process.env.JWT_AUTH_TOKEN!,
				{},
			);
			return true;
		} catch (_) {
			return false;
		}
	}
	static signAuthToken(payload: any): string {
		return jwt.sign(payload, process.env.JWT_AUTH_TOKEN!, {
			expiresIn: '30M',
		});
	}
	static signRefreshToken(payload: any): string {
		return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN!);
	}
}
