"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation_middleware = validation_middleware;
exports.auth_validation_middleware = auth_validation_middleware;
const express_validator_1 = require("express-validator");
const auth_1 = require("../../types/auth");
const jsonwebtoken_1 = require("jsonwebtoken");
function validation_middleware(req, resp, next) {
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty())
        return resp.status(400).send({ errors: result.array() });
    next();
}
async function auth_validation_middleware(req, resp, next) {
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty())
        return resp.status(400).send({ errors: result.array() });
    const auth_token = req.cookies.authToken;
    if (!auth_token)
        return resp.sendStatus(601);
    try {
        const token_valid = auth_1.Auth.verify_auth_token(auth_token, true);
        const verified_refresh_token = await auth_1.Auth.verify_refresh_token(token_valid);
        if (verified_refresh_token) {
            auth_1.Auth.verify_auth_token(auth_token);
            req.auth = auth_token;
            return next();
        }
        return resp.status(602).send({ error: 'no active session' });
    }
    catch (err) {
        console.log(err.message);
        if (err instanceof jsonwebtoken_1.JsonWebTokenError &&
            err.message.toLowerCase().includes('expired'))
            return resp.sendStatus(601); // expired
        else if (err instanceof jsonwebtoken_1.JsonWebTokenError)
            return resp.sendStatus(401); // invalid token
        return resp.sendStatus(500);
    }
}
