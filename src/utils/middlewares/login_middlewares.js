"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login_middleware = login_middleware;
exports.logout_middleware = logout_middleware;
const users_1 = require("../functions/users");
const auth_1 = require("../../types/auth");
const constants_1 = require("../constants");
async function login_middleware(req, resp, next) {
    const user_credential = req.body;
    try {
        const id = await (0, users_1.check_user_credential_valid)(user_credential);
        if (id.toString() !== id) {
            return resp.status(400).send({ errors: id });
        }
        const auth = new auth_1.Auth({ user_id: id });
        await (0, users_1.login_user)(auth);
        resp.cookie(constants_1.cookieConfig.refreshToken.name, auth.token, constants_1.cookieConfig.refreshToken.options);
        return resp.status(200).send({
            auth_token: auth.generate_auth_token(),
        });
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
async function logout_middleware(req, resp, next) {
    try {
        const refresh_token = auth_1.Auth.verify_auth_token(req.auth);
        await (0, users_1.logout_user)(refresh_token);
        resp.clearCookie(constants_1.cookieConfig.refreshToken.name, constants_1.cookieConfig.refreshToken.options);
        return resp.sendStatus(200);
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
