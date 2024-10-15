"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGIN_VALIDATION_SCHEMA = void 0;
const constants_1 = require("../constants");
exports.LOGIN_VALIDATION_SCHEMA = {
    username: {
        in: ["body"],
        notEmpty: {
            errorMessage: "username must not be empty"
        },
        matches: {
            options: constants_1.USERNAME_VALIDATION_REGEX,
            errorMessage: "invalid username"
        }
    },
    password: {
        in: ["body"],
        notEmpty: {
            errorMessage: "password must not be empty"
        },
        isStrongPassword: {
            errorMessage: "invalid password"
        }
    }
};
