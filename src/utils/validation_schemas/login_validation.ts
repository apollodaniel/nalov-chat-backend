import { Schema } from "express-validator";
import { USERNAME_VALIDATION_REGEX } from "../constants";

export const LOGIN_VALIDATION_SCHEMA: Schema = {
	username: {
		notEmpty: {
			errorMessage: "username must not be empty"
		},
		matches: {
			options: USERNAME_VALIDATION_REGEX,
			errorMessage: "invalid username"
		}
	},
	password: {
		notEmpty: {
			errorMessage: "password must not be empty"
		},
		isStrongPassword: {
			errorMessage: "invalid password"
		}
	}
};