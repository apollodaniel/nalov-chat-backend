import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { Auth } from "../../types/auth";

export function receive_file_middleware(name?: string) {
	return async function (req: Request, resp: Response, next: NextFunction) {


		if (
			!req.headers["content-type"] ||
			!req.headers["content-type"]?.startsWith("multipart/form-data")
		)
			return resp.sendStatus(400);

		const user_id = new Auth({token: Auth.verify_auth_token(req.auth)});

		const BASE_PATH = './files/';
		const file_path = path.join(BASE_PATH, `${user_id.user_id}/`);

		if(!fs.existsSync(file_path))
			fs.mkdirSync(file_path);

		const file_boundary = req.headers["content-type"]
			.split(";")[1]
			.replace("boundary=", "")
			.trim();

		let filename: string | undefined = name;
		let content_length = parseInt(req.headers["content-length"]!);

		let file_end_boundary = parse_boundary(file_boundary).trim() + "--";


		let progress = 0;

		let first_chunk = true;

		let headers = Buffer.alloc(0);
		let stream: fs.WriteStream | undefined;


		req.on("data", async (data: Uint8Array) => {
			let buffer = Buffer.from(data);


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
						path.join(file_path, filename),
						chunk_content,
						"binary",
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

					headers = buffer
						.slice(0, headers_end_index);

					const chunk_content = buffer.slice(
						headers_end_index,
						buffer.length,
					);

					stream = fs.createWriteStream(
						path.join(file_path, filename),
						{ flags: "a" },
					);
					await fs.promises.writeFile(
						path.join(file_path, filename),
						chunk_content,
						"binary",
					);
					// content end
				}
			} else {

				if (
					progress +
						buffer.byteLength +
						Buffer.from(headers).byteLength +
						Buffer.from(file_end_boundary).byteLength +
						4 >=
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

					stream!.end();
					await fs.promises.appendFile(
						path.join(file_path, filename!),
						chunk_content,
						"binary",
					);

					next();
					// content part
			} else {
				stream!.write(buffer, "binary");
			}
			}

			progress += data.byteLength;
		});


		req.on("error", () => {
			resp.sendStatus(500);
		});
	}
}

function parse_boundary(boundary: string): string{
	let last_start_index = 0;
	for(let char of boundary.split("")){
		if(char !== "-")
			break;

		last_start_index++;
	}

	return boundary.substring(last_start_index, boundary.length);
}

