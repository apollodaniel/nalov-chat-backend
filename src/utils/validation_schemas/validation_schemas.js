"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_AUTH_SCHEMA = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.VALID_AUTH_SCHEMA = {
    authorization: {
        in: ["headers"],
        custom: {
            options: (v) => {
                const splitted_value = v.split(" ");
                return (v.length > 2 &&
                    jsonwebtoken_1.default.verify(v[1], process.env.JWT_AUTH_TOKEN, {}));
            },
            errorMessage: "invalid authorization",
        },
    },
};
