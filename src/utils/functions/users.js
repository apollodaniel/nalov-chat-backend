"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register_user = register_user;
exports.login_user = login_user;
exports.delete_user = delete_user;
exports.logout_user = logout_user;
exports.get_users = get_users;
exports.get_single_user = get_single_user;
exports.get_users_with_query = get_users_with_query;
exports.check_user_credential_valid = check_user_credential_valid;
exports.check_user_token_valid = check_user_token_valid;
const user_1 = require("../../types/user");
const constants_1 = require("../constants");
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const glob_1 = require("glob");
const fs_1 = __importDefault(require("fs"));
async function register_user(user) {
    const db = db_1.ChatAppDatabase.getInstance();
    await db.exec_db(user.toInsert());
}
async function login_user(auth) {
    const db = db_1.ChatAppDatabase.getInstance();
    try {
        // check for username existence
        await db.exec_db(auth.toInsert());
    }
    catch (err) {
        if (err.message !== constants_1.error_map.user_already_logged_in.error_msg)
            throw err;
    }
}
async function delete_user(user_id) {
    const iterator = glob_1.glob.iterate(`./files/chats/*${user_id}*`);
    for await (const entry of iterator) {
        try {
            await fs_1.default.promises.rm(entry, {
                recursive: true,
                maxRetries: 3,
                retryDelay: 100,
                force: true,
            });
        }
        finally {
            console.log('Deleted entry ' + entry);
        }
    }
    const db = db_1.ChatAppDatabase.getInstance();
    await db.exec_db(user_1.User.toDelete(user_id));
}
async function logout_user(refresh_token) {
    const db = db_1.ChatAppDatabase.getInstance();
    await db.exec_db(`DELETE FROM auth WHERE token = '${refresh_token}'`);
}
async function get_users() {
    const db = db_1.ChatAppDatabase.getInstance();
    return (await db.query_db('SELECT * FROM users')).rows.map((e) => new user_1.User(e));
}
async function get_single_user(id) {
    const db = db_1.ChatAppDatabase.getInstance();
    const users = (await db.query_db(`SELECT * FROM users WHERE id = '${id}'`))
        .rows;
    if (users.length === 0)
        throw Error('not found');
    return new user_1.User(users[0]);
}
async function get_users_with_query({ user_id, query, limit = 10, }) {
    const db = db_1.ChatAppDatabase.getInstance();
    let queries = [];
    for (const _query of query) {
        if (typeof _query.search === 'string') {
            queries.push(`${_query.field} like '%${_query.search}%'`);
            continue;
        }
        queries.push(`${_query.field} = ${_query.search}`);
    }
    console.log(`SELECT * FROM users WHERE id != '${user_id}'${queries.length > 0 ? ' and ' + queries.join(' and ') : ''} ORDER BY name limit ${limit}`);
    const result = await db.query_db(`SELECT * FROM users WHERE id != '${user_id}'${queries.length > 0 ? ' and ' + queries.join(' and ') : ''} ORDER BY name limit ${limit}`);
    return result.rows;
}
async function check_user_credential_valid(credentials) {
    const db = db_1.ChatAppDatabase.getInstance();
    let result_username = await db.query_db(`SELECT * FROM users WHERE username = '${credentials.username}'`);
    let result_pass = await db.query_db(`SELECT * FROM users WHERE password = '${credentials.password}'`);
    let errors = [];
    if (result_pass.rowCount === 0) {
        errors.push(constants_1.error_map.invalid_credentials.error_obj);
    }
    if (result_username.rowCount === 0) {
        errors.push(constants_1.error_map.username_not_exists.error_obj);
    }
    if (result_username.rowCount != 0 && result_pass.rowCount != 0) {
        return result_username.rows[0].id;
    }
    return errors;
}
async function check_user_token_valid(token, type) {
    try {
        const result = jsonwebtoken_1.default.verify(token, type == 'refresh'
            ? process.env.JWT_REFRESH_TOKEN
            : process.env.JWT_AUTH_TOKEN);
        const db = await db_1.ChatAppDatabase.getInstance().initDB();
        if (type === 'auth') {
            const query = await db.query(`SELECT * FROM auth WHERE token = '${result}'`);
            return query.rowCount != 0;
        }
        else {
            const query = await db.query(`SELECT * FROM users WHERE id = '${result}'`);
            return query.rowCount != 0;
        }
    }
    catch (err) {
        return false;
    }
}
