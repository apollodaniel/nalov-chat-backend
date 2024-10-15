"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTER_VALIDATION_SCHEMA = void 0;
const constants_1 = require("../constants");
const uuid_1 = require("uuid");
exports.REGISTER_VALIDATION_SCHEMA = {
    id: {
        customSanitizer: {
            options: () => (0, uuid_1.v4)()
        }
    },
    username: {
        in: ["body"],
        notEmpty: {
            errorMessage: "username must not be empty",
        },
        isString: {
            errorMessage: "username must be a valid string",
        },
        isLength: {
            options: {
                min: 4,
                max: 12,
            },
        },
        matches: {
            options: RegExp(constants_1.USERNAME_VALIDATION_REGEX),
            errorMessage: "invalid username",
        },
    },
    name: {
        in: ["body"],
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
        }
    },
    password: {
        in: ["body"],
        notEmpty: {
            errorMessage: "password must not be empty"
        },
        isString: {
            errorMessage: "password must be a valid string"
        },
        isStrongPassword: {
            errorMessage: "password is weak"
        },
        isLength: {
            options: {
                min: 8
            },
            errorMessage: "password must be at least 8 characters long"
        }
    }
};
