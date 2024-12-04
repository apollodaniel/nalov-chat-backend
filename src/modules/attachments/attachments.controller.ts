import { Request, Response } from 'express';
import { AttachmentsServices } from './attachments.services';
import { CommonUtils } from '../shared/common.utils';

export class AttachmentsController {
	static async getAttachments(req: Request, resp: Response) {
		const messageId = req.params.id;
		try {
			const attachments =
				await AttachmentsServices.getAttachments(messageId);
			return resp.status(200).json(attachments);
		} catch (err: any) {
			CommonUtils.sendError(resp, err);
		}
	}
}
