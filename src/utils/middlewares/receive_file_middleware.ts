import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import { Auth } from '../../types/auth';
import {
	get_attachments,
	get_messages,
	get_single_message,
	update_attachment,
} from '../functions/messages';
import { EVENT_EMITTER } from '../constants';
import {
	Attachment,
	IAttachment,
	IMessage,
	Message,
} from '../../types/message';
import { get_users_chat_id } from '../functions';
import { pdf } from 'pdf-to-img';
import { header, matchedData } from 'express-validator';

interface WritableAttachment extends IAttachment {
	fileStream: fs.WriteStream;
}
function parseMiddleFileChunk(
	buffer: Buffer,
	attachments: WritableAttachment[],
) {
	const headerEndIndex = getChunkHeaderEndIndex(buffer);
	if (headerEndIndex === -1)
		throw new Error('could not get header end index');

	const fileHeader = buffer
		.slice(0, headerEndIndex)
		.toString('binary')
		.trim(); // + 4 bytes from \r\n

	const fileNameMatch = fileHeader.match(/name=".+";/);

	if (!fileNameMatch || fileNameMatch.length === 0)
		throw new Error('expected filename field on form data');

	const filename = fileNameMatch[0].replace('name="', '').replace('";', '');

	const contentTypeMatch = fileHeader.match(/Content-Type:.+/);

	if (!contentTypeMatch || contentTypeMatch.length === 0)
		throw new Error('expected content type field on form data');
	const content_type = contentTypeMatch[0]
		.replace('Content-Type: ', '')
		.replace('\r', '')
		.replace('\n', '')
		.trim();

	const fileContent = buffer.slice(headerEndIndex, buffer.byteLength);

	const attachment = attachments.find((att) => att.id === filename);
	if (!attachment) throw new Error(`no matches for filename '${filename}'`);
	attachment.fileStream.write(fileContent);
	if (
		content_type !== 'application/octet-stream' &&
		content_type !== 'text/plain'
	) {
		update_attachment(
			new Attachment({ ...attachment }).toUpdateMimeType(content_type),
		);
		if (content_type === 'application/pdf')
			attachment.fileStream.on('finish', () =>
				generate_file_preview(attachment, () => {
					console.log(`Generated pdf preview to ${attachment.id}`);
				}),
			);
	}

	return filename;
}
function parseFileChunk(
	buffer: Buffer,
	matched_boundaries: string[],
	attachments: WritableAttachment[],
) {
	const headerEndIndex = getChunkHeaderEndIndex(buffer);
	if (headerEndIndex === -1)
		throw new Error('could not get header end index');

	const fileHeader = buffer
		.slice(matched_boundaries[0].length, headerEndIndex)
		.toString('binary')
		.trim(); // + 4 bytes from \r\n

	const fileNameMatch = fileHeader.match(/name=".+";/);

	if (!fileNameMatch || fileNameMatch.length === 0)
		throw new Error('expected filename field on form data');

	const filename = fileNameMatch[0].replace('name="', '').replace('";', '');

	const contentTypeMatch = fileHeader.match(/Content-Type:.+/);

	if (!contentTypeMatch || contentTypeMatch.length === 0)
		throw new Error('expected content type field on form data');
	const content_type = contentTypeMatch[0]
		.replace('Content-Type: ', '')
		.replace('\r', '')
		.replace('\n', '')
		.trim();

	const fileContent = buffer.slice(
		headerEndIndex,
		matched_boundaries.length > 1
			? buffer.indexOf(matched_boundaries[1])
			: // + Buffer.from(matched_boundaries[0]).byteLength
				buffer.byteLength,
	);

	const attachment = attachments.find((att) => att.id === filename);
	if (!attachment) throw new Error(`no matches for filename '${filename}'`);
	attachment.fileStream.write(fileContent);

	if (
		content_type !== 'application/octet-stream' &&
		content_type !== 'text/plain'
	) {
		if (content_type === 'application/pdf')
			generate_file_preview(attachment, () => {
				console.log(`Generated pdf preview to ${attachment.id}`);
			});
		update_attachment(
			new Attachment({ ...attachment }).toUpdateMimeType(content_type),
		);
	}

	return filename;
}
export function getChunkHeaderEndIndex(buffer: Buffer): number {
	const buffer_str = buffer.toString('binary');
	const content_type_match = buffer_str.match(/Content-Type:.+/);

	if (!content_type_match || content_type_match.length === 0) return -1;

	return (
		buffer.indexOf(content_type_match[0]) + content_type_match[0].length + 4
	); // + 8 bytes from \r\n\r\n
}

function updateMimeTypeAndGeneratePreview(
	buffer: Buffer,
	attachment: WritableAttachment,
	message: IMessage,
) {
	const buffer_str = buffer.toString('binary');
	const content_type_match = buffer_str.match(/Content-Type:.+/);

	if (!content_type_match) {
		console.log('Could not find mime type');
		return;
	}

	let mime_type = content_type_match[0]
		.replace('Content-Type: ', '')
		.replace('\r', '')
		.replace('\n', '');

	if (mime_type === 'text/plain' || mime_type === 'application/octet-stream')
		return; // ignore these mimetypes
	else if (mime_type === 'application/pdf') {
		// waits file be written to get his preview
		attachment.fileStream.on('finish', () =>
			generate_file_preview(attachment, () =>
				notify_received_attachment(message, attachment),
			),
		);
	} else {
		// adds notify received attachment as callback to filestream on finish
		attachment.fileStream.on('finish', () =>
			notify_received_attachment(message, attachment),
		);
	}

	// update mime type
	update_attachment(
		new Attachment({ ...attachment }).toUpdateMimeType(mime_type),
	);
}

function parseChunk(
	buffer: Buffer,
	headers: any,
	attachmentStack: WritableAttachment[],
	message: Message,
	boundaryCount: number,
): WritableAttachment[] {
	console.log(attachmentStack[0].filename);
	const file_boundary = headers['content-type']
		.split(';')[1]
		.replace('boundary=', '')
		.trim();

	const buffer_str = buffer.toString('binary');
	let matched_boundaries_obj = Array.from(
		buffer_str.matchAll(new RegExp(`-*${file_boundary}-*`, 'g')),
	);

	const matched_boundaries = matched_boundaries_obj.map((match) => match[0]);
	console.log(matched_boundaries);
	let boundaryOcurrences: number[] = matched_boundaries_obj.map(
		(match) => match.index,
	);

	const matchedFilename = Array.from(buffer_str.matchAll(/name=".+";/g));

	// gets the ocurrence that matches the current attachment id
	let matchingOcurrence = matchedFilename.at(0); // instead of checking all buffer
	// checks only the first occurence..

	let sortedAttachmentStack = [...attachmentStack];
	// remember to update mime types and generate file preview for pdf
	// use a external function for this
	const firstBoundaryPrevContent = buffer
		.slice(0, boundaryOcurrences[0] || 0)
		.toString('binary');
	if (matchingOcurrence && firstBoundaryPrevContent.length === 0) {
		// ocurrs only when file starts right on the start of the chunk (first file usually)
		// or when it got recursivly here
		sortedAttachmentStack = attachmentStack.sort((a, b) =>
			a.id === matchingOcurrence[0] ? -1 : 0,
		);

		// sort attachment stack
		// let tempAttStack: WritableAttachment[] = [];
		// for(let i = 0; i < matchedFilename.length; i++){
		// 	let att = sortedAttachmentStack.find((att)=>att.id === matchedFilename[i][0]);
		// 	if(att) tempAttStack.push(att);
		// }
		// // add remaing attachments for stack
		// // and put it on sortedAttachmentStack
		// sortedAttachmentStack = [...tempAttStack, ...(sortedAttachmentStack.filter((sAtt)=>tempAttStack.find((att)=>att.id === sAtt.id)))];
		console.log(`${sortedAttachmentStack[0].id} start`);
		if (matchedFilename.length > 1) {
			// first attachment starts and ends on this chunk, but there's more
			// files to write.
			// split the content from the attachment starts and pass it
			// recursivly to this function
			const fieldHeaderEndIndex = getChunkHeaderEndIndex(buffer);
			updateMimeTypeAndGeneratePreview(
				buffer,
				sortedAttachmentStack[0],
				message,
			); // updates mime type
			const content = buffer.slice(
				fieldHeaderEndIndex,
				boundaryOcurrences[1],
			);
			sortedAttachmentStack[0].fileStream.write(content);
			return parseChunk(
				buffer.slice(boundaryOcurrences[1], buffer.byteLength),
				headers,
				sortedAttachmentStack.filter((_value, index) => index !== 0), // pass the sortedAttachmentStack without first item
				message,
				boundaryCount,
			);
		} else if (matched_boundaries.length === 2) {
			// first attachment starts and ends on this chunk
			const fieldHeaderEndIndex = getChunkHeaderEndIndex(buffer);
			updateMimeTypeAndGeneratePreview(
				buffer,
				sortedAttachmentStack[0],
				message,
			); // updates mime type
			const content = buffer.slice(
				fieldHeaderEndIndex,
				boundaryOcurrences[1],
			);
			sortedAttachmentStack[0].fileStream.write(content);
			sortedAttachmentStack[0].fileStream.end();
			return sortedAttachmentStack.filter((_value, index) => index !== 0); // removes first attachment from stack
		} else if (matched_boundaries.length < 2) {
			// first attachment only starts on this chunk
			const fieldHeaderEndIndex = getChunkHeaderEndIndex(buffer);
			updateMimeTypeAndGeneratePreview(
				buffer,
				sortedAttachmentStack[0],
				message,
			); // updates mime type
			const content = buffer.slice(
				fieldHeaderEndIndex,
				buffer.byteLength,
			);
			sortedAttachmentStack[0].fileStream.write(content);
			return sortedAttachmentStack;
		}
		return sortedAttachmentStack;
	} else if (matched_boundaries.length === 0) {
		// writing middle of first attachment of stack content

		sortedAttachmentStack[0].fileStream.write(buffer); // write everything because this is raw file content
		console.log(`${sortedAttachmentStack[0].id} middle`);
		return sortedAttachmentStack;
	} else {
		// first attachment of stack is ending here
		// WARNING - Before passing the chunk away, check if the post content of it is empty
		// if it is, break look and do nothing, if not pass the content away
		// remove first attachment from stack, split the buffer at the end, and use recursivity
		// to pass it to it self and repeat the process for the rest of the chunk

		let endingContent = buffer.slice(0, boundaryOcurrences[0]);

		// everything after current attachment end
		let postEndContent = buffer
			.slice(
				boundaryOcurrences[0] +
					Buffer.from(matched_boundaries[0]).byteLength,
				buffer.byteLength,
			)
			.toString('binary')
			.replace('\r', '')
			.replace('\n', '')
			.trim();
		console.log(`${sortedAttachmentStack[0].id} ending`);
		sortedAttachmentStack[0].fileStream.write(endingContent);
		if (matched_boundaries.length > 1 || postEndContent.length > 0) {
			// may start and end some other files
			let postContentBuffer = buffer.slice(
				boundaryOcurrences[0],
				buffer.byteLength,
			);
			return parseChunk(
				postContentBuffer,
				headers,
				sortedAttachmentStack.filter((_value, index) => index !== 0), // removes first attachment from stack
				message,
				boundaryCount,
			);
		}

		return sortedAttachmentStack.filter((_value, index) => index !== 0);
	}
}

export async function receive_file_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	if (
		!req.headers['content-type'] ||
		!req.headers['content-type']?.startsWith('multipart/form-data')
	)
		return resp.sendStatus(400);

	const message_id: string | undefined = req.query.message_id?.toString();

	// check message_id
	if (!message_id) return resp.sendStatus(401);

	const user_id = new Auth({ token: Auth.verify_auth_token(req.auth) })
		.user_id;
	const message = await get_single_message(user_id, message_id);

	let attachments: WritableAttachment[] = (
		await get_attachments(message_id)
	).map((a: IAttachment) => {
		const stream = fs.createWriteStream(a.path, {
			encoding: 'binary',
			flags: 'a',
		});
		return {
			...a,
			fileStream: stream,
		} as WritableAttachment;
	});

	if (attachments.length === 0) return resp.sendStatus(400);

	// create message directory
	let splitted_path = attachments[0].path.split('/');
	splitted_path = splitted_path.filter(
		(_v, _index) => _index != splitted_path.length - 1,
	);

	const dir_path = splitted_path.join('/');
	if (!fs.existsSync(dir_path)) fs.mkdirSync(dir_path, { recursive: true });

	let boundaryCount = 0;
	let attachmentStack = [...attachments];
	req.on('data', (data: Uint8Array) => {
		let buffer = Buffer.from(data);
		// rawFileStream.write(buffer);
		// rawFileStream.write(Buffer.from("DIVISAO DE CHUNK"));

		if (attachmentStack.length === 0)
			console.log('Reached end of attachment stack with data to receive');

		const attStack = [
			...parseChunk(
				buffer,
				req.headers,
				attachmentStack,
				message,
				boundaryCount,
			),
		];
		attachmentStack = attStack;
	});

	req.on('end', () => {
		attachments.forEach((a) => a.fileStream.end());
	});
	req.on('close', () => {
		attachments.forEach((a) => a.fileStream.end());
	});
	req.on('error', () => {
		attachments.forEach((a) => a.fileStream.end());
		return resp.sendStatus(500);
	});
}

async function generate_file_preview(
	attachment: WritableAttachment,
	callback: () => void,
) {
	const preview_path = `${attachment.path}.png`;
	try {
		const document = await pdf(attachment.path, {});
		let preview_page;

		for await (const page of document) {
			preview_page = page;
			break;
		}

		if (!preview_page) {
			callback();
			return;
		}
		await fs.promises.writeFile(preview_path, preview_page, {
			encoding: 'binary',
		});

		update_attachment(
			new Attachment({ ...attachment }).toUpdatePreviewPath(preview_path),
		).then(() => callback());
	} catch (err: any) {
		console.log(
			`Could not generate preview for attachment ${attachment.filename}\n${err.message}`,
		);
	}
}

function notify_received_attachment(
	message: IMessage,
	attachment: IAttachment,
) {
	update_attachment(
		new Attachment({ ...attachment }).toUpdateDate(Date.now()),
	);
	EVENT_EMITTER.emit(
		`update-${get_users_chat_id(message.receiver_id, message.sender_id)}`,
	);
}
