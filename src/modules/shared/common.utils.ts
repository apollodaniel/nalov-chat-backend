import { Response } from 'express';
import { ErrorEntry } from './common.types';

export class CommonUtils {
	static sendError(resp: Response, err: ErrorEntry) {
		console.log(err.message);
		return resp.status(err.statusCode || 500).json({
			error: err,
		});
	}
}
