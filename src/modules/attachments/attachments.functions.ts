import { join } from 'path';

export function getAttachmentPath(
	chatId: string,
	messageId: string,
	attachmentId: string,
	filename: string,
	options?: {
		hasPreview: boolean;
	},
) {
	const path = join(
		'files/',
		chatId,
		messageId,
		`${attachmentId}.${getFileExtension(filename)}`,
	);
	if (options?.hasPreview) {
		return [path, `${path}.png`];
	}
	return path;
}

export function getFileExtension(filename: string) {
	const splittedFilename = filename.split('/');
	return splittedFilename[splittedFilename.length - 1]
		.split('.')
		.slice(1)
		.join('.');
}
