"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_PATCH_SINGLE_VALIDATION_SCHEMA = exports.USERS_GET_VALIDATION_SCHEMA = exports.USER_GET_SINGLE_VALIDATION_SCHEMA = void 0;
exports.USER_GET_SINGLE_VALIDATION_SCHEMA = {
    id: {
        notEmpty: {
            errorMessage: "id must not be empty",
        },
        isString: {
            errorMessage: "id must be a valid string",
        },
    },
};
exports.USERS_GET_VALIDATION_SCHEMA = {
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
exports.USER_PATCH_SINGLE_VALIDATION_SCHEMA = {
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
