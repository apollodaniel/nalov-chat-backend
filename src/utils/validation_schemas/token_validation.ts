import { Schema } from "express-validator";

export const TOKEN_VALIDATION_SCHEMA: Schema = {
	token: {
		notEmpty: {
			errorMessage: "Token must not be empty"
		},
		isString: {
			errorMessage: "Token must be a string"
		}
	},
	type: {
		notEmpty: {
			errorMessage: "token type must not be empty"
		},
		custom: {
			options: (value)=> value === "Auth" || "Refresh",
			errorMessage: "token type must be Auth either Refresh"
		}
	}
};
