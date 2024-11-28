import { Request, Response } from 'express';
import {
	AttachmentsErrorCodes,
	AttachmentsErrorStatusCodes,
} from './attachments.errors';
import { AttachmentsServices } from './attachments.services';

export class AttachmentsController {
	static async getAttachments(req: Request, resp: Response) {
		const messageId = req.params.id;
		try {
			const attachments = await AttachmentsServices.getAttachments(
				req.userId!,
				messageId,
			);
			return resp.status(200).json(attachments);
		} catch (err: any) {
			return this.sendError(resp, err);
		}
	}

	private static sendError(resp: Response, err: any) {
		return resp
			.status(
				AttachmentsErrorStatusCodes[
					err.message as AttachmentsErrorCodes
				],
			)
			.json({
				error: {
					kind: 'ATTACHMENTS',
					code: err.message,
					description:
						AttachmentsErrorCodes[
							err.message as AttachmentsErrorCodes
						],
				},
			});
	}
}
