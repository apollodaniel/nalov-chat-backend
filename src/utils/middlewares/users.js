"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users_get_middleware = users_get_middleware;
exports.users_get_single_middleware = users_get_single_middleware;
exports.get_current_user_middleware = get_current_user_middleware;
exports.users_patch_single_middleware = users_patch_single_middleware;
exports.delete_user_middleware = delete_user_middleware;
const users_1 = require("../functions/users");
const user_1 = require("../../types/user");
const auth_1 = require("../../types/auth");
const jsonwebtoken_1 = require("jsonwebtoken");
const db_1 = require("../db");
async function users_get_middleware(req, resp, next) {
    const { filter_field, filter_value } = req.query;
    // filter field depends on filter value and vice-versa
    if ((filter_field && !filter_value) || (filter_value && !filter_field))
        return resp.sendStatus(400);
    try {
        const current_user_id = new auth_1.Auth({
            token: auth_1.Auth.verify_auth_token(req.auth),
        }).user_id;
        const users = (await (0, users_1.get_users_with_query)({
            user_id: current_user_id,
            query: filter_field && filter_value
                ? [
                    {
                        field: filter_field,
                        search: filter_value,
                    },
                ]
                : [],
            limit: 6,
        }))
            .filter((u) => current_user_id != u.id)
            .map((u) => {
            return {
                ...u,
                profile_picture: u.profile_picture
                    ? u.profile_picture
                    : 'public/profile-pictures/default.png',
                password: undefined,
            };
        });
        return resp.status(200).send(users);
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
async function users_get_single_middleware(req, resp, next) {
    const user_id = req.params.id;
    try {
        const user = await (0, users_1.get_single_user)(user_id);
        return resp.status(200).send({
            ...user,
            password: undefined,
        });
    }
    catch (err) {
        console.log(err.message);
        if (err.message == 'not found')
            return resp.sendStatus(404);
        return resp.sendStatus(500);
    }
}
async function get_current_user_middleware(req, resp, next) {
    const auth = req.auth;
    try {
        const auth_obj = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) });
        const user = await (0, users_1.get_single_user)(auth_obj.user_id);
        return resp.send({ ...user, password: undefined });
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            return resp.sendStatus(401);
        }
        return resp.sendStatus(500);
    }
}
async function users_patch_single_middleware(req, resp, next) {
    const auth = req.auth;
    try {
        const auth_obj = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) });
        console.log(req.body);
        if (req.query.name) {
            const db = db_1.ChatAppDatabase.getInstance();
            await db.exec_db(user_1.User.toPatch(auth_obj.user_id, {
                name: req.body.name,
            }));
        }
        next();
    }
    catch (err) {
        console.log(err.message);
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            return resp.sendStatus(401);
        }
        return resp.sendStatus(500);
    }
}
async function delete_user_middleware(req, resp, next) {
    const auth_token = req.auth;
    const auth = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth_token) });
    try {
        await (0, users_1.delete_user)(auth.user_id);
        return resp.sendStatus(200);
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
