"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieConfig = exports.error_map = exports.EVENT_EMITTER = exports.USERNAME_VALIDATION_REGEX = exports.CREATE_ATTACHMENTS_TABLE = exports.CREATE_AUTH_TABLE = exports.CREATE_MESSAGE_TABLE = exports.CREATE_USER_TABLE = void 0;
const eventemitter2_1 = require("eventemitter2");
exports.CREATE_USER_TABLE = `CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY NOT NULL, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password TEXT NOT NULL, profile_picture TEXT)`;
exports.CREATE_MESSAGE_TABLE = `CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY NOT NULL, content TEXT NOT NULL, creation_date BIGINT NOT NULL, last_modified_date BIGINT NOT NULL, seen_date BIGINT, sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE)`;
exports.CREATE_AUTH_TABLE = `CREATE TABLE IF NOT EXISTS auth(token TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE)`;
exports.CREATE_ATTACHMENTS_TABLE = `CREATE TABLE IF NOT EXISTS attachments (id text NOT NULL, message_id TEXT NOT NULL REFERENCES messages(
id), path text NOT NULL, preview_path TEXT,  filename text NOT NULL, date bigint)`;
exports.USERNAME_VALIDATION_REGEX = `^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$`;
exports.EVENT_EMITTER = new eventemitter2_1.EventEmitter2({
    wildcard: true,
    verboseMemoryLeak: true,
});
exports.error_map = {
    username_already_exists: {
        error_msg: 'duplicate key value violates unique constraint "users_username_key"',
        error_obj: {
            type: 'username_already_exists_error',
            path: 'username',
            location: 'body',
            msg: 'this username already exists',
        },
    },
    username_not_exists: {
        error_obj: {
            type: 'username_not_exists_error',
            path: 'username',
            location: 'body',
            msg: 'this username does not exists',
        },
    },
    content_must_not_be_empty: {
        error_obj: {
            type: 'field error',
            path: 'content',
            location: 'body',
            msg: 'content must not be empty',
        },
    },
    invalid_credentials: {
        error_msg: 'invalid user credentials',
        error_obj: {
            type: 'invalid_credentials',
            path: 'password',
            location: 'body',
            msg: 'invalid password',
        },
    },
    user_already_logged_in: {
        error_msg: 'duplicate key value violates unique constraint "auth_pkey"',
        error_obj: {
            type: 'user_already_logged',
            msg: 'user already logged in',
        },
    },
    db_not_found: {
        error_msg: 'not found',
    },
    // Additional errors can be added here
};
exports.cookieConfig = {
    refreshToken: {
        name: 'refreshToken',
        options: {
            //path: '/', // For production, use '/auth/api/refresh-tokens'. We use '/' for localhost in order to work on Chrome.
            httpOnly: true,
            expirate: 30 * 24 * 60 * 60 * 1000, // 30 days of duration
            //sameSite: 'none' as 'none',
        },
    },
    authToken: {
        name: 'authToken',
        options: {
            expirate: 30 * 60 * 1000,
            //path: '/', // For production, use '/auth/api/refresh-tokens'. We use '/' for localhost in order to work on Chrome.
            httpOnly: true,
            //sameSite: 'none' as 'none',
        },
    },
};
