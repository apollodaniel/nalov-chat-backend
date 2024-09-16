import { join } from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";
import { User } from "../../types/user";
import { ChatAppDatabase } from "../db";
import { get_attachment } from "../functions/messages";
import { EVENT_EMITTER } from "../constants";

export async  function receive_file_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	if (
		!req.headers["content-type"] ||
		!req.headers["content-type"]?.startsWith("multipart/form-data")
	)
		return resp.sendStatus(400);

	const attachment_id: string|undefined = req.query.attachment_id?.toString();

	// check attachment
	if(!attachment_id)
		return resp.sendStatus(401);


	const auth = req.auth!;
	const auth_obj = new Auth({ token: Auth.verify_auth_token(auth) });
	const user_id = auth_obj.user_id;

	let file_path = `./files/${user_id}/`;

	if (!fs.existsSync(file_path)) fs.mkdirSync(file_path);

	const file_boundary = req.headers["content-type"]
		.split(";")[1]
		.replace("boundary=", "")
		.trim();

	const attachment = await get_attachment(attachment_id);
	const file_extension = attachment.filename.match(/\.[^.]+$/);
	let filename = `${attachment.id}${file_extension && file_extension[0] || ""}`;

	let content_length = parseInt(req.headers["content-length"]!);
	let file_end_boundary = parse_boundary(file_boundary).trim() + "--";

	let progress = 0;

	let first_chunk = true;

	let headers = Buffer.alloc(0);

	let data_size = 0;

	console.log(req.headers);

	let fileStream: fs.WriteStream = fs.createWriteStream(join(file_path, filename), {
		encoding: "binary",
		flags: "a"
	});

	req.on("data", (data: Uint8Array) => {
		let buffer = Buffer.from(data);

		progress++;

		if (data.byteLength > data_size) data_size = data.byteLength;

		if (first_chunk) {
			first_chunk = false;

			if (
				buffer
					.toString()
					.trim()
					.startsWith("--" + file_boundary) &&
				buffer.toString().trim().endsWith(file_end_boundary)
			) {
				console.log("One chunk only");

				fs.writeFileSync(join(file_path, filename), "", "binary");
				if (!filename)
					filename = buffer
						.toString()
						.match(/filename="([^"]+)"/)![0]
						.replace('filename="', "")
						.replace('"', "");

				const headers_end_index =
					buffer.indexOf(
						"\r\n\r\n",
						buffer.indexOf(Buffer.from("--" + file_boundary)),
					) + 4;
				const end_boundary_index =
					buffer.indexOf(Buffer.from(file_end_boundary)) - 4;

				const chunk_content = buffer.slice(
					headers_end_index,
					end_boundary_index - Buffer.from(file_end_boundary).length,
				);

				fileStream.write(chunk_content);
				// start of content

				fileStream.close();
				next();
			} else if (
				buffer
					.toString()
					.trim()
					.startsWith("--" + file_boundary)
			) {
				console.log("Start");
				// file

				fs.writeFileSync(join(file_path, filename), "", "binary");
				if (!filename)
					filename = buffer
						.toString("binary")
						.match(/filename="([^"]+)"/)![0]
						.replace('filename="', "")
						.replace('"', "");

				const headers_end_index =
					buffer.indexOf(
						"\r\n\r\n",
						buffer.indexOf('name="profile_picture"'),
					) + 4;

				headers = buffer.slice(0, headers_end_index);

				const chunk_content = buffer.slice(
					headers_end_index,
					buffer.length,
				);

				fileStream.write(chunk_content);
				// content end

			}
		} else {
			if (progress * data_size < content_length)
				fileStream.write(data);
			else{
				let ending_index = buffer
					.slice(0, buffer.lastIndexOf(Buffer.from("\r")))
					.lastIndexOf(Buffer.from("\r"));

				const chunk_content = buffer.slice(0, ending_index);

				fileStream.write(chunk_content);

				EVENT_EMITTER.emit(`received-file-${attachment.id}`);

				console.log("Finished");
				fileStream.close();
				next();
			}
		}
	});

	req.on("error", () => {
		fileStream.close();
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
