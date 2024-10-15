"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register_middleware = register_middleware;
const user_1 = require("../../types/user");
const constants_1 = require("../constants");
const users_1 = require("../functions/users");
async function register_middleware(req, resp, next) {
    try {
        await (0, users_1.register_user)(new user_1.User({ ...req.body }));
        return resp.sendStatus(204);
    }
    catch (err) {
        if (err.message == constants_1.error_map.username_already_exists.error_msg)
            return resp.status(400).send({ errors: [constants_1.error_map.username_already_exists.error_obj] });
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
