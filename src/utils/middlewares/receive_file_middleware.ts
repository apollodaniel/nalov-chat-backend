import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";
import {
	get_attachments,
	get_messages,
	get_single_message,
	update_attachment_mimetype,
} from "../functions/messages";
import { EVENT_EMITTER } from "../constants";
import { IAttachment } from "../../types/message";
import { get_users_chat_id } from "../functions";

export async function receive_file_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	if (
		!req.headers["content-type"] ||
		!req.headers["content-type"]?.startsWith("multipart/form-data")
	)
		return resp.sendStatus(400);

	interface WritableAttachment extends IAttachment {
		fileStream: fs.WriteStream;
	}

	const message_id: string | undefined = req.query.message_id?.toString();

	// check message_id
	if (!message_id) return resp.sendStatus(401);

	const user_id = new Auth({ token: Auth.verify_auth_token(req.auth) })
		.user_id;
	const message = await get_single_message(user_id, message_id);

	let file_boundary = req.headers["content-type"]
		.split(";")[1]
		.replace("boundary=", "")
		.trim();

	let filename = (attachment: IAttachment) => {
		const file_extension = attachment.filename.match(/\.[^.]+$/);
		return `${attachment.id}${(file_extension && file_extension[0]) || ""}`;
	};

	let attachments: WritableAttachment[] = (
		await get_attachments(message_id)
	).map((a: IAttachment) => {
		return {
			...a,
			fileStream: fs.createWriteStream(a.path, {
				encoding: "binary",
				flags: "a",
			}),
		} as WritableAttachment;
	});

	if (attachments.length != 0) {
		let splitted_path = attachments[0].path.split("/");
		splitted_path = splitted_path.filter(
			(_v, _index) => _index != splitted_path.length - 1,
		);
		const dir_path = splitted_path.join("/");
		console.log(dir_path);
		if (!fs.existsSync(dir_path))
			fs.mkdirSync(dir_path, { recursive: true });
	}

	let progress = 0;
	let overallProgress = 0;

	let first_chunk = true;
	// let data_size = 0;

	// let rawFileStream: fs.WriteStream = fs.createWriteStream(
	//     join(file_path, "raw_file"),
	//     {
	//         flags: "a",
	//         encoding: "binary",
	//     },
	// );
	//
	let actual_file_header = Buffer.alloc(0);

	req.on("data", (data: Uint8Array) => {
		let buffer = Buffer.from(data);

		if (attachments.length === 0)
			throw Error("no more attachments for this data");

		// rawFileStream.write(data);

		// if (data.byteLength > data_size) data_size = data.byteLength;

		if (first_chunk) {
			first_chunk = false;

			// fs.writeFileSync(
			// 	join(file_path, filename(attachments[0])),
			// 	"",
			// 	"binary",
			// );

			const matched_boundary = buffer
				.toString()
				.substring(
					0,
					buffer.toString().indexOf(file_boundary) +
					file_boundary.length,
				)
				.trim();
			const boundary_ocurrences = buffer
				.toString()
				.substring(
					buffer.toString().indexOf(matched_boundary),
					buffer.toString().length,
				)
				.trim()
				.split(matched_boundary)
				.filter(
					(c) =>
						c.trim().replace("\n", "").replace("\r", "").length !=
						0,
				);

			let ocurrences = boundary_ocurrences.length;

			const headers_end_index =
				buffer.indexOf(
					"\r\n\r\n",
					buffer.indexOf(Buffer.from(matched_boundary)),
				) + 4;

			// disabled - expected one file only from request
			// if (ocurrences > 2) return resp.sendStatus(400);

			actual_file_header = buffer.slice(0, headers_end_index);

			const matched_field_name = actual_file_header
				.toString("binary")
				.match(/name=".+?"/);

			if (!matched_field_name)
				throw new Error(
					`no matches for field name ${actual_file_header}`,
				);

			let field_name = matched_field_name[0]
				.replace('name="', "")
				.replace('"', "");

			const matched_mime_type = actual_file_header
				.toString("binary")
				.match(/Content-Type: .+\r\n/);

			if (matched_mime_type && matched_mime_type[0]) {
				// change attachment mime type
				let mime_type = matched_mime_type[0]
					.replace("Content-Type: ", "")
					.replace("\r\n", "")
					.trim();
				update_attachment_mimetype(attachments[0], mime_type);
			}

			attachments = attachments.sort((at) =>
				at.id === matched_field_name![0] ? -1 : 0,
			);

			if (attachments.length === 0 || attachments[0].id !== field_name)
				throw new Error(
					`no matched attachment for file with id ${field_name} and name ${filename(attachments[0])}`,
				);

			const boundary_end = buffer.lastIndexOf(
				Buffer.from(matched_boundary),
			);

			if (
				ocurrences > 1
				// buffer.slice(boundary_end, buffer.byteLength).byteLength === 0
			) {
				// one chunk only
				console.log("One chunk only");

				const content = buffer.slice(
					headers_end_index,
					buffer
						.slice(0, buffer.lastIndexOf(Buffer.from("\r")))
						.lastIndexOf(Buffer.from("\r")),
				);

				attachments[0].fileStream.write(content);
				progress += Number(content.byteLength);
				overallProgress += Number(content.byteLength);

				attachments[0].fileStream.close();
				EVENT_EMITTER.emit(`update-${get_users_chat_id(message.receiver_id, message.sender_id)}`); // temporary solution for single file attachment send
				// setTimeout(
				// 	() =>
				// 		EVENT_EMITTER.emit(
				// 			`update-${get_users_chat_id(message.receiver_id, user_id)}`,
				// 		),
				// 	2000,
				// );
				next();
			} else if (
				// start chunk only
				ocurrences === 1
			) {
				console.log("Start");

				const content = buffer.slice(
					headers_end_index,
					buffer.byteLength,
				);
				attachments[0].fileStream.write(content);

				progress += Number(content.byteLength);
				overallProgress += Number(content.byteLength);
			} // no file being sent // invalid request
			else return resp.sendStatus(400);
		} else {
			// const file_length: number =
			// 	Number(attachments[0].byte_length) +
			// 	Number(actual_file_header.byteLength) +
			// 	Number(Buffer.from(file_boundary).byteLength) +
			// 	4; //  2 bytes for carriage returns, 2 for --

			if (
				progress + Number(data.byteLength) <=
				Number(attachments[0].byte_length)
			) {
				attachments[0].fileStream.write(data);
				progress += Number(data.byteLength);
				overallProgress += Number(data.byteLength);
			} else {
				let previous_content = buffer.slice(
					0,
					buffer.indexOf(file_boundary),
				);
				previous_content = previous_content.slice(
					0,
					previous_content.lastIndexOf(Buffer.from("\r")) + 2,
				);

				attachments[0].fileStream.write(previous_content);
				progress += Number(previous_content.byteLength);
				overallProgress += Number(previous_content.byteLength);

				EVENT_EMITTER.emit(`update-${get_users_chat_id(message.receiver_id, message.sender_id)}`); // temporary solution for single file attachment send
				// setTimeout(
				// 	() =>
				// 		EVENT_EMITTER.emit(
				// 			`update-${get_users_chat_id(message.receiver_id, user_id)}`,
				// 		),
				// 	2000,
				// );

				console.log(`Finished: ${attachments[0].filename}`);

				let post_content = buffer.slice(
					previous_content.byteLength,
					buffer.length,
				);

				const post_content_check = post_content
					.slice(post_content.indexOf("\r"), post_content.byteLength)
					.toString()
					.replace("\r", "")
					.replace("\n", "")
					.trim();
				if (post_content_check.length !== 0) {
					const content_type_match = post_content
						.toString("binary")
						.match(/Content-Type:\ .+\r\n/);

					const headers_end_index =
						post_content.indexOf(content_type_match![0]) +
						Number(Buffer.from(content_type_match![0]).byteLength) +
						2;
					const headers = post_content.slice(0, headers_end_index);

					const matched_field_name = headers
						.toString("binary")
						.match(/name=".+?"/);

					post_content = post_content.slice(
						headers_end_index,
						post_content.byteLength,
					);

					// close filestream and remove current attachment from list
					attachments[0].fileStream.close();
					attachments = attachments.filter(
						(a) => attachments[0].id !== a.id,
					);

					// put first attachment as being the current file
					attachments = attachments.sort((at) =>
						at.id ===
							matched_field_name![0]
								.replace('name="', "")
								.replace('"', "")
							? -1
							: 0,
					);

					actual_file_header = headers;
					const matched_mime_type = actual_file_header
						.toString("binary")
						.match(/Content-Type: .+\r\n/);

					if (matched_mime_type && matched_mime_type[0]) {
						// change attachment mime type
						let mime_type = matched_mime_type[0]
							.replace("Content-Type: ", "")
							.replace("\r\n", "")
							.trim();
						update_attachment_mimetype(attachments[0], mime_type);
					}

					if (!matched_field_name) {
						// next chunk
						first_chunk = true;
					} else {
						// prepare next file filestream
						// attachments[0].fileStream = attachments[0].fileStream;
						attachments[0].fileStream.write(post_content);
						progress = Number(post_content.byteLength);
						overallProgress += Number(post_content.byteLength);
					}
				} else {
					// rawFileStream.close();
					next();
				}
			}
		}
	});

	req.on("error", () => {
		attachments.forEach((a) => a.fileStream.close());
		// rawFileStream.close();
		return resp.sendStatus(500);
	});
}

function parse_boundary(boundary: string): string {
	let last_start_index = 0;
	for (let char of boundary.split("")) {
		if (char !== "-") break;

		last_start_index++;
	}

	return boundary.substring(last_start_index, boundary.length);
}
