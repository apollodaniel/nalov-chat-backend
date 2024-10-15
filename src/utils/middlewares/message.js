"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.message_get_middleware = message_get_middleware;
exports.message_get_attachments_middleware = message_get_attachments_middleware;
exports.message_get_single_middleware = message_get_single_middleware;
exports.message_put_middleware = message_put_middleware;
exports.message_patch_middleware = message_patch_middleware;
exports.message_delete_middleware = message_delete_middleware;
exports.chats_get_middleware = chats_get_middleware;
const auth_1 = require("../../types/auth");
const messages_1 = require("../functions/messages");
const message_1 = require("../../types/message");
const constants_1 = require("../constants");
const uuid_1 = require("uuid");
const functions_1 = require("../functions");
async function message_get_middleware(req, resp, next) {
    const auth = req.auth;
    const sender_id = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) }).user_id;
    const receiver_id = (typeof req.query.receiver_id === "string" && req.query.receiver_id) ||
        "";
    try {
        const messages = await (0, messages_1.get_messages)(sender_id, receiver_id);
        return (resp
            .status(200)
            // .send({ user_id: sender_id, messages: messages });
            .send(messages));
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
async function message_get_attachments_middleware(req, resp, next) {
    const auth = req.auth;
    const user_id = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) }).user_id;
    const message_id = req.params.id;
    try {
        if (!(await (0, messages_1.check_message_permission)(user_id, message_id)))
            return resp.sendStatus(401); // user that requested the resource is not allowed to read it
        const attachments = await (0, messages_1.get_attachments)(message_id);
        return resp.status(200).send(attachments);
    }
    catch (err) {
        console.log(err.message);
        if ((err.message = constants_1.error_map.db_not_found.error_msg))
            return resp.sendStatus(404);
        return resp.sendStatus(500);
    }
}
async function message_get_single_middleware(req, resp, next) {
    const auth = req.auth;
    const auth_obj = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) });
    const message_id = req.query.id;
    try {
        const message = await (0, messages_1.get_messages)(auth_obj.user_id, message_id);
        return resp.status(200).send(message);
    }
    catch (err) {
        console.log(err.message);
        if ((err.message = constants_1.error_map.db_not_found.error_msg))
            return resp.sendStatus(404);
        return resp.sendStatus(500);
    }
}
async function message_put_middleware(req, resp, next) {
    const auth = req.auth;
    const user_id = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) });
    if ((!req.body.content || req.body.content.length === 0) &&
        (!req.body.attachments || req.body.attachments.length === 0)) {
        return resp.status(400).send([constants_1.error_map.content_must_not_be_empty]);
    }
    try {
        const message = new message_1.Message({
            ...req.body,
            attachments: [], // get empty attachments to not conflict
            sender_id: user_id.user_id,
        });
        if (req.body.attachments) {
            for (const attachment of (req.body.attachments ||
                [])) {
                const file_extension = attachment.filename.match(/\.[^.]+$/);
                const id = (0, uuid_1.v4)();
                const attachment_path = `files/chats/${(0, functions_1.get_users_chat_id)(message.receiver_id, user_id.user_id)}/${message.id}/${id}${(file_extension && file_extension[0]) || ""}`;
                message.attachments = [
                    new message_1.Attachment({
                        ...attachment,
                        id: id,
                        message_id: message.id,
                        path: attachment_path,
                    }),
                    ...message.attachments,
                ];
            }
        }
        // creation_date and last_modified_date must have same value on creation
        if (message.creation_date != message.last_modified_date)
            message.last_modified_date = message.creation_date;
        console.log(message);
        await (0, messages_1.create_message)(message);
        constants_1.EVENT_EMITTER.emit(`update-${(0, functions_1.get_users_chat_id)(message.receiver_id, user_id.user_id)}`);
        return resp.send({ message_id: message.id });
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
async function message_patch_middleware(req, resp, next) {
    const auth = req.auth;
    const auth_obj = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) });
    const message_id = req.params.id;
    const message = await (0, messages_1.get_single_message)(auth_obj.user_id, message_id);
    try {
        if (!(await (0, messages_1.check_message_permission)(auth_obj.user_id, message_id)))
            return resp.sendStatus(401); // user that requested the resource is not allowed to read it
        await (0, messages_1.patch_message)({ id: message_id, ...req.body });
        constants_1.EVENT_EMITTER.emit(`update-${(0, functions_1.get_users_chat_id)(message.receiver_id, message.sender_id)}`);
        return resp.sendStatus(200);
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
async function message_delete_middleware(req, resp, next) {
    const auth_token = req.auth;
    const auth = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth_token) });
    const message_id = req.params.id;
    if (!message_id)
        return resp.sendStatus(403);
    const message = await (0, messages_1.get_single_message)(auth.user_id, message_id);
    if (message.sender_id !== auth.user_id)
        return resp.sendStatus(401);
    try {
        await (0, messages_1.delete_message)(auth.user_id, message_id);
        constants_1.EVENT_EMITTER.emit(`update-${(0, functions_1.get_users_chat_id)(message.receiver_id, auth.user_id)}`);
        return resp.sendStatus(200);
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
async function chats_get_middleware(req, resp, next) {
    const auth = req.auth;
    const user_id = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) }).user_id;
    try {
        const chats = await (0, messages_1.get_chats)(user_id);
        return resp.status(200).send(chats);
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
