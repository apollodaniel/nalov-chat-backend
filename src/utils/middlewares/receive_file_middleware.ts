import { join } from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";
import { User } from "../../types/user";
import { ChatAppDatabase } from "../db";
import { AxiosError } from "axios";

export function receive_file_middleware(obj?: { is_profile_picture: boolean }) {
	return async function (req: Request, resp: Response, next: NextFunction) {
		const { is_profile_picture } = obj || { is_profile_picture: false };

		if (
			!req.headers["content-type"] ||
			(!req.headers["content-type"]?.startsWith("multipart/form-data") &&
				!is_profile_picture)
		)
			return resp.sendStatus(400);
		else if (
			!req.headers["content-type"] ||
			(!req.headers["content-type"]?.startsWith("multipart/form-data") &&
				!is_profile_picture)
		)
			next();

		const user_id = new Auth({ token: Auth.verify_auth_token(req.auth) });

		let file_path = join("files/", `${user_id.user_id}/`);

		if (!fs.existsSync(file_path)) fs.mkdirSync(file_path);

		const file_boundary = req.headers["content-type"]
			.split(";")[1]
			.replace("boundary=", "")
			.trim();

		let filename: string | undefined;

		const auth = req.auth;
		if (is_profile_picture) {
			const auth_obj = new Auth({ token: Auth.verify_auth_token(auth) });
			const user_id = auth_obj.user_id;
			file_path = "public/profile-picture/";
			filename = `${user_id}.png`;
		}

		let content_length = parseInt(req.headers["content-length"]!);
		console.log(content_length);
		let file_end_boundary = parse_boundary(file_boundary).trim() + "--";

		let progress = 0;

		let first_chunk = true;

		let headers = Buffer.alloc(0);

		let data_size = 0;

		req.on("data", async (data: Uint8Array) => {
			let buffer = Buffer.from(data);

			progress ++;

			if(data.byteLength > data_size)
				data_size = data.byteLength;

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
						end_boundary_index -
							Buffer.from(file_end_boundary).length,
					);

					await fs.promises.writeFile(
						join(file_path, filename),
						chunk_content,
						{
							flag: "w",
							encoding: "binary"
						},
					);
					// start of content

					return next();
				} else if (
					buffer
						.toString()
						.trim()
						.startsWith("--" + file_boundary)
				) {
					console.log("start");
					if (!filename)
						filename = buffer
							.toString("binary")
							.match(/filename="([^"]+)"/)![0]
							.replace('filename="', "")
							.replace('"', "");

					const headers_end_index =
						buffer.indexOf(
							"\r\n\r\n",
							buffer.indexOf(Buffer.from("--" + file_boundary)),
						) + 4;

					headers = buffer.slice(0, headers_end_index);

					const chunk_content = buffer.slice(
						headers_end_index,
						buffer.length,
					);

					await fs.promises.writeFile(
						join(file_path, filename),
						chunk_content,
						"binary"
					);
					// content end
				}
			} else {

				if (
					progress * data_size >=
					content_length
				) {
					console.log("Finished");
					const end_boundary_index =
						buffer.indexOf(Buffer.from(file_end_boundary)) - 4;
					const chunk_content = buffer.slice(
						0,
						end_boundary_index -
							Buffer.from(file_end_boundary).length,
					);


					await fs.promises.appendFile(
						join(file_path, filename!),
						chunk_content,
						"binary",
					);

					if (is_profile_picture) {
						try {
							const auth_obj = new Auth({
								token: Auth.verify_auth_token(auth),
							});
							const user_id = auth_obj.user_id;
							const db = ChatAppDatabase.getInstance();
							await db.exec_db(
								User.toPatch(user_id, {
									profile_picture: join(file_path, filename!),
								}),
							);
						} catch (err: any) {
							console.log(err.message);
							throw err;
						}
					}

					next();
					// content part
				} else {
					await fs.promises.appendFile(
						join(file_path, filename!),
						data,
						"binary",
					);
				}
			}
		});

		req.on("error", () => {
			return resp.sendStatus(500);
		});
	};
}

function parse_boundary(boundary: string): string {
	let last_start_index = 0;
	for (let char of boundary.split("")) {
		if (char !== "-") break;

		last_start_index++;
	}

	return boundary.substring(last_start_index, boundary.length);
}
