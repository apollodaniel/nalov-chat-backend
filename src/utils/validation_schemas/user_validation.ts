import { Schema } from "express-validator";

export const USER_GET_SINGLE_VALIDATION_SCHEMA: Schema = {
	id: {
		notEmpty: {
			errorMessage: "id must not be empty"
		},
		isString: {
			errorMessage: "id must be a valid string"
		}
	}
};
