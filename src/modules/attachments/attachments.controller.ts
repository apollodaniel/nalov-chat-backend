import { Request, Response } from 'express';
import {
	AttachmentsErrorCodes,
	AttachmentsErrorStatusCodes,
} from './attachments.errors';
import { AttachmentsService } from './attachments.service';

export class AttachmentsController {
	static async getAttachments(req: Request, resp: Response) {
		const messageId = req.params.id;
		try {
			const attachments = await AttachmentsService.getAttachments(
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
					kind: 'MESSAGE',
					code: err.message,
					description:
						AttachmentsErrorCodes[
							err.message as AttachmentsErrorCodes
						],
				},
			});
	}
}
