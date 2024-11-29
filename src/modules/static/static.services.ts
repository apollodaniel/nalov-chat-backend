import fs from 'fs';
import { AppDataSource } from '../../data-source';
import { Attachment } from '../attachments/attachments.entity';
import { AttachmentRepository } from '../attachments/attachments.repository';
import pdftopic from 'pdftopic';
import { Message } from '../messages/messages.entity';
import { MessageServices } from '../messages/messages.services';
import { StaticFileErrorCodes } from './static.errors';

interface WritableAttachment extends Attachment {
	fileStream: fs.WriteStream;
}

export class StaticServices {
	private static repo = AppDataSource.getRepository(Attachment).extend(
		AttachmentRepository.prototype,
	);

	private static async notifyAttachment(attachment: Attachment) {
		await this.repo.updateAttachment(attachment.id, {
			...attachment,
			timestamp: Date.now(),
		});
		await MessageServices.notifyMessageChanges(attachment.messageId);
	}
	private static getChunkHeaderEndIndex(buffer: Buffer): number {
		const bufferStr = buffer.toString('binary');
		const contentTypeMatch = bufferStr.match(/Content-Type:.+/);

		if (!contentTypeMatch || contentTypeMatch.length === 0) return -1;

		return (
			buffer.indexOf(contentTypeMatch[0]) + contentTypeMatch[0].length + 4
		); // + 8 bytes from \r\n\r\n
	}

	private static async generateFilePreview(
		attachment: WritableAttachment,
		callback: () => void,
	) {
		const previewPath = `${attachment.path}.png`;
		try {
			const pdf = await fs.promises.readFile(attachment.path);
			const singlePage = await pdftopic.pdftobuffer(pdf, 0);

			if (!singlePage) {
				return;
			}
			await fs.promises.writeFile(previewPath, singlePage, {
				encoding: 'binary',
			});

			await this.repo.updateAttachment(attachment.id, {
				...attachment,
				previewPath: previewPath,
			});
			callback();
		} catch (err: any) {
			console.log(
				`Could not generate preview for attachment ${attachment.filename}\n${err.message}`,
			);
		}
	}

	static async updateMimeTypeAndGeneratePreview(
		buffer: Buffer,
		attachment: WritableAttachment,
	) {
		const bufferStr = buffer.toString('binary');
		const contentTypeMatch = bufferStr.match(/Content-Type:.+/);

		if (!contentTypeMatch) {
			console.log('Could not find mime type');
			return;
		}

		let mimeType = contentTypeMatch[0]
			.replace('Content-Type: ', '')
			.replace('\r', '')
			.replace('\n', '');

		if (
			mimeType === 'text/plain' ||
			mimeType === 'application/octet-stream'
		)
			return; // ignore these mimetypes
		else if (mimeType === 'application/pdf') {
			// waits file be written to get his preview
			attachment.fileStream.on('finish', () =>
				this.generateFilePreview(attachment, () =>
					this.notifyAttachment(attachment),
				),
			);
		} else {
			// adds notify received attachment as callback to filestream on finish
			attachment.fileStream.on('finish', () =>
				this.notifyAttachment(attachment),
			);
		}

		// update mime type
		//	update_attachment(
		//		new Attachment({ ...attachment }).toUpdateMimeType(mimeType),
		//	);
		this.repo.updateAttachment(attachment.id, {
			...attachment,
			mimeType: mimeType,
		});
	}

	// main function
	static parseChunk(
		buffer: Buffer,
		headers: any,
		attachmentStack: WritableAttachment[],
		message: Message,
		boundaryCount: number,
	): WritableAttachment[] {
		const fileBoundary = headers['content-type']
			.split(';')[1]
			.replace('boundary=', '')
			.trim();

		const bufferStr = buffer.toString('binary');
		let boundaryList = Array.from(
			bufferStr.matchAll(new RegExp(`-*${fileBoundary}-*`, 'g')),
		);

		const matchedBoundaries = boundaryList.map((match) => match[0]);
		let boundaryOcurrences: number[] = boundaryList.map(
			(match) => match.index,
		);

		const matchedFilename = Array.from(bufferStr.matchAll(/name=".+";/g));

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
			if (matchedFilename.length > 1) {
				// first attachment starts and ends on this chunk, but there's more
				// files to write.
				// split the content from the attachment starts and pass it
				// recursivly to this function
				const fieldHeaderEndIndex = this.getChunkHeaderEndIndex(buffer);
				this.updateMimeTypeAndGeneratePreview(
					buffer,
					sortedAttachmentStack[0],
				); // updates mime type
				const content = buffer.slice(
					fieldHeaderEndIndex,
					boundaryOcurrences[1],
				);
				sortedAttachmentStack[0].fileStream.write(content);
				return this.parseChunk(
					buffer.slice(boundaryOcurrences[1], buffer.byteLength),
					headers,
					sortedAttachmentStack.filter(
						(_value, index) => index !== 0,
					), // pass the sortedAttachmentStack without first item
					message,
					boundaryCount,
				);
			} else if (matchedBoundaries.length === 2) {
				// first attachment starts and ends on this chunk
				const fieldHeaderEndIndex = this.getChunkHeaderEndIndex(buffer);
				this.updateMimeTypeAndGeneratePreview(
					buffer,
					sortedAttachmentStack[0],
				); // updates mime type
				const content = buffer.slice(
					fieldHeaderEndIndex,
					boundaryOcurrences[1],
				);
				sortedAttachmentStack[0].fileStream.write(content);
				sortedAttachmentStack[0].fileStream.end();
				return sortedAttachmentStack.filter(
					(_value, index) => index !== 0,
				); // removes first attachment from stack
			} else if (matchedBoundaries.length < 2) {
				// first attachment only starts on this chunk
				const fieldHeaderEndIndex = this.getChunkHeaderEndIndex(buffer);
				this.updateMimeTypeAndGeneratePreview(
					buffer,
					sortedAttachmentStack[0],
				); // updates mime type
				const content = buffer.slice(
					fieldHeaderEndIndex,
					buffer.byteLength,
				);
				sortedAttachmentStack[0].fileStream.write(content);
				return sortedAttachmentStack;
			}
			return sortedAttachmentStack;
		} else if (matchedBoundaries.length === 0) {
			// writing middle of first attachment of stack content

			sortedAttachmentStack[0].fileStream.write(buffer); // write everything because this is raw file content
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
						Buffer.from(matchedBoundaries[0]).byteLength,
					buffer.byteLength,
				)
				.toString('binary')
				.replace('\r', '')
				.replace('\n', '')
				.trim();
			sortedAttachmentStack[0].fileStream.write(endingContent);
			if (matchedBoundaries.length > 1 || postEndContent.length > 0) {
				// may start and end some other files
				let postContentBuffer = buffer.slice(
					boundaryOcurrences[0],
					buffer.byteLength,
				);
				return this.parseChunk(
					postContentBuffer,
					headers,
					sortedAttachmentStack.filter(
						(_value, index) => index !== 0,
					), // removes first attachment from stack
					message,
					boundaryCount,
				);
			}

			return sortedAttachmentStack.filter((_value, index) => index !== 0);
		}
	}

	static async fileUpload(
		message: Message,
		headers: any,
	): Promise<{
		onData: (data: Uint8Array) => void;
		onError: (err: any) => any;
		onExit: () => void;
	}> {
		let attachments: WritableAttachment[] = (
			await this.repo.getAttachments(message.id)
		).map((a: Attachment) => {
			const stream = fs.createWriteStream(a.path, {
				encoding: 'binary',
				flags: 'a',
			});
			return {
				...a,
				fileStream: stream,
			} as WritableAttachment;
		});

		if (attachments.length === 0)
			throw new Error(StaticFileErrorCodes.NO_ATTACHMENTS);

		// create message directory
		let splitted_path = attachments[0].path.split('/');
		splitted_path = splitted_path.filter(
			(_v, _index) => _index != splitted_path.length - 1,
		);

		const dir_path = splitted_path.join('/');
		if (!fs.existsSync(dir_path))
			fs.mkdirSync(dir_path, { recursive: true });

		let boundaryCount = 0;
		let attachmentStack = [...attachments];

		return {
			onData: (data: Uint8Array) => {
				let buffer = Buffer.from(data);
				// rawFileStream.write(buffer);
				// rawFileStream.write(Buffer.from("DIVISAO DE CHUNK"));

				if (attachmentStack.length === 0)
					console.log(
						'Reached end of attachment stack with data to receive',
					);

				const attStack = [
					...this.parseChunk(
						buffer,
						headers,
						attachmentStack,
						message,
						boundaryCount,
					),
				];
				attachmentStack = attStack;
			},
			onExit: () => {
				attachments.forEach((a) => a.fileStream.end());
			},
			onError: () => {
				attachments.forEach((a) => a.fileStream.end());
				return new Error(StaticFileErrorCodes.UNKNOWN_ERROR);
			},
		};
	}
}
