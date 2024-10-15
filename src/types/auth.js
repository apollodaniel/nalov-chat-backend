"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../utils/db");
class Auth {
    token;
    user_id;
    constructor(args) {
        const { token, user_id } = args;
        if (token) {
            this.token = token;
            const id = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_TOKEN, {});
            if (typeof id !== 'string')
                throw new Error('invalid token');
            this.user_id = id;
        }
        else {
            this.token = jsonwebtoken_1.default.sign(user_id, process.env.JWT_REFRESH_TOKEN, {});
            this.user_id = user_id;
        }
    }
    generate_auth_token() {
        return jsonwebtoken_1.default.sign({ refresh_token: this.token }, process.env.JWT_AUTH_TOKEN, { expiresIn: '5s' });
    }
    static verify_auth_token(auth_token, ignore_expiration) {
        const verified_token = jsonwebtoken_1.default.verify(auth_token, process.env.JWT_AUTH_TOKEN, { ignoreExpiration: ignore_expiration || false });
        return verified_token.refresh_token;
    }
    static async verify_refresh_token(token) {
        jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_TOKEN, {});
        const db = db_1.ChatAppDatabase.getInstance();
        const result = await db.query_db(`SELECT * FROM auth WHERE token = '${token}'`);
        return result.rowCount !== 0;
    }
    toInsert() {
        return `INSERT INTO auth(token, user_id) values ('${this.token}', '${this.user_id}')`;
    }
    toDelete() {
        return `DELETE FROM auth WHERE token = '${this.token}'`;
    }
}
exports.Auth = Auth;
