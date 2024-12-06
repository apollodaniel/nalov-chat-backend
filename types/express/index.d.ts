import 'express';

declare global {
	namespace Express {
		interface Request {
			auth?: any;
			userId?: string;
		}
	}
}
