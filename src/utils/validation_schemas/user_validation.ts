import { Schema } from "express-validator";
import { USERNAME_VALIDATION_REGEX } from "../constants";

export const USER_GET_SINGLE_VALIDATION_SCHEMA: Schema = {
	id: {
		notEmpty: {
			errorMessage: "id must not be empty",
		},
		isString: {
			errorMessage: "id must be a valid string",
		},
	},
};

export const USERS_GET_VALIDATION_SCHEMA: Schema = {
	filter_field: {
		optional: true,
		in: ["query"],
		isString: {
			errorMessage: "filter_field must be a valid string",
		},
	},
	filter_value: {
		optional: true,
		in: ["query"],
		isString: {
			errorMessage: "filter_value must be a valid string",
		},
	},
};

export const USER_PATCH_SINGLE_VALIDATION_SCHEMA: Schema = {
	name: {
		in: ["query", "body"],
		optional: true,
		notEmpty: {
			errorMessage: "name must not be empty",
		},
		isString: {
			errorMessage: "name must be a valid string",
		},
		isLength: {
			options: {
				min: 4,
				max: 100,
			},
		},
	},
};
