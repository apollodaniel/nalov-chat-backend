import { join } from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";
import { User } from "../../types/user";
import { ChatAppDatabase } from "../db";

export function user_patch_middleware(
	req: Request,
	resp: Response,
	next: NextFunction,
) {
	if (
		!req.headers["content-type"] ||
		!req.headers["content-type"]?.startsWith("multipart/form-data")
	)
		return resp.sendStatus(400);

	const auth = req.auth!;
	const auth_obj = new Auth({ token: Auth.verify_auth_token(auth) });
	const user_id = auth_obj.user_id;

	let file_path = "./public/profile-picture/";

	if (!fs.existsSync(file_path)) fs.mkdirSync(file_path);

	const file_boundary = req.headers["content-type"]
		.split(";")[1]
		.replace("boundary=", "")
		.trim();

	let filename = `${user_id}.png`;

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

				const matched_boundary = buffer.toString().substring(0, buffer.toString().indexOf(file_boundary) + file_boundary.length).trim();

				const ocurrences = buffer
					.toString()
					.substring(buffer.toString().indexOf(matched_boundary), buffer.toString().length)
					.trim()
					.split(matched_boundary)
					.filter((c)=> c.trim().replace("\n", "").replace("\r", "").length!=0)
					.length;

				// check other fields
				if (ocurrences > 1) {
					const boundary_end = buffer.lastIndexOf(
						Buffer.from(matched_boundary),
					);
					let name_field = buffer.slice(0, boundary_end);

					// check if one boundary only

					// + 2 for skipping '--' and last escape codes
					buffer = buffer.slice(boundary_end + matched_boundary.length+4, buffer.length);

					let new_name = name_field.slice(name_field.indexOf(
						"\r\n\r\n",
						name_field.indexOf('name="name"') + 4,
					), name_field.length);

					const new_name_parsed = new_name.toString("binary").replace("\n", "").replace("\r", "").trim();

					patch_user_name(user_id, new_name_parsed);
				}

				// no more content
				if (
					buffer.length === 0
				)
					return next();

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

				const matched_boundary = buffer.toString().substring(0, buffer.toString().indexOf(file_boundary) + file_boundary.length).trim();

				const ocurrences = buffer
					.toString()
					.substring(buffer.toString().indexOf(matched_boundary), buffer.toString().length)
					.trim()
					.split(matched_boundary)
					.filter((c)=> c.trim().replace("\n", "").replace("\r", "").length!=0)
					.length;

				// check other fields
				if (ocurrences > 1) {
					const boundary_end = buffer.lastIndexOf(
						Buffer.from(matched_boundary),
					);
					let name_field = buffer.slice(0, boundary_end);

					// check if one boundary only

					// + 2 for skipping '--' and last escape codes
					buffer = buffer.slice(boundary_end + matched_boundary.length+4, buffer.length);

					let new_name = name_field.slice(name_field.indexOf(
						"\r\n\r\n",
						name_field.indexOf('name="name"') + 4,
					), name_field.length);

					const new_name_parsed = new_name.toString("binary").replace("\n", "").replace("\r", "").trim();

					patch_user_name(user_id, new_name_parsed);
				}

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

				// modify user profile picture
				patch_user_profile_picture(user_id);

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



async function patch_user_name(user_id: string, name: string) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(
		User.toPatch(user_id, {
			name: name,
		}),
	);
}

async function patch_user_profile_picture(user_id: string) {
	const db = ChatAppDatabase.getInstance();
	await db.exec_db(
		User.toPatch(user_id, {
			profile_picture: join(`public/profile-pictures`, `${user_id}.png`),
		}),
	);
}

function parse_boundary(boundary: string): string {
	let last_start_index = 0;
	for (let char of boundary.split("")) {
		if (char !== "-") break;

		last_start_index++;
	}

	return boundary.substring(last_start_index, boundary.length);
}
