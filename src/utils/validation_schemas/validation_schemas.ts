import { Schema } from "express-validator";
import jwt from 'jsonwebtoken';

export const VALID_AUTH_SCHEMA: Schema = {
	authorization: {
		in: ["headers"],

		custom: {
			options: (v: string)=>{
				const splitted_value = v.split(" ");
				return v.length > 2 && jwt.verify(v[1],  process.env.JWT_AUTH_TOKEN!, {});
			},
			errorMessage: "invalid authorization"
		}
	}
};
