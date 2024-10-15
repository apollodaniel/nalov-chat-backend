"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.token_middleware = token_middleware;
exports.check_token_middleware = check_token_middleware;
const auth_1 = require("../../types/auth");
const constants_1 = require("../constants");
function token_middleware(req, resp, next) {
    const ref_token = req.cookies.refreshToken;
    if (!ref_token)
        return resp.sendStatus(602);
    try {
        const refresh_token_auth = new auth_1.Auth({ token: ref_token });
        const auth_token = refresh_token_auth.generate_auth_token();
        resp.cookie(constants_1.cookieConfig.authToken.name, auth_token, constants_1.cookieConfig.authToken.options);
        return resp.status(200).send({ token: auth_token });
    }
    catch (err) {
        console.log(err.message);
        if (err.message === 'invalid token' || err.message === 'jwt_malformed')
            return resp.sendStatus(401);
        return resp.sendStatus(500);
    }
}
async function check_token_middleware(req, resp, next) {
    const auth_token = req.cookies.authToken;
    const refresh_token = req.cookies.refreshToken;
    console.log(req.cookies);
    if (!refresh_token)
        return resp.sendStatus(602);
    if (!auth_token)
        return resp.sendStatus(601);
    return resp.send({ valid: true });
}
