"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_message = parse_message;
exports.get_messages = get_messages;
exports.get_chats = get_chats;
exports.check_message_permission = check_message_permission;
exports.get_single_message = get_single_message;
exports.get_attachments = get_attachments;
exports.update_attachment = update_attachment;
exports.create_message = create_message;
exports.patch_message = patch_message;
exports.delete_message = delete_message;
const message_1 = require("../../types/message");
const db_1 = require("../db");
const user_1 = require("../../types/user");
const functions_1 = require("../functions");
const constants_1 = require("../constants");
const fs_1 = __importDefault(require("fs"));
async function parse_message(message) {
    const db = db_1.ChatAppDatabase.getInstance();
    const attachments = (await db.query_db(`SELECT * FROM attachments WHERE message_id = '${message.id}'`)).rows.map((a) => new message_1.Attachment(a));
    return new message_1.Message({ ...message, attachments: attachments });
}
async function get_messages(sender_id, receiver_id) {
    const db = db_1.ChatAppDatabase.getInstance();
    const messages = (await db.query_db(`SELECT * FROM messages WHERE (sender_id = '${sender_id}' AND receiver_id = '${receiver_id}') OR (sender_id = '${receiver_id}' AND receiver_id = '${sender_id}') ORDER BY creation_date`)).rows;
    await db.exec_db(`UPDATE messages SET seen_date = ${Date.now()} WHERE seen_date IS NULL AND sender_id = '${receiver_id}' AND receiver_id = '${sender_id}'`);
    const messages_obj = await Promise.all(messages
        .filter((msg) => (msg.attachments || []).every((a) => a.date))
        .map(async (msg) => await parse_message(msg)));
    console.log(messages_obj[0]);
    return messages_obj;
}
async function get_chats(user_id) {
    const db = await db_1.ChatAppDatabase.getInstance().initDB();
    const chats = [
        ...(await db.query(`SELECT DISTINCT ON (LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id)) CASE WHEN sender_id = '${user_id}' THEN receiver_id ELSE sender_id END AS user_id, id FROM messages WHERE '${user_id}' IN (receiver_id, sender_id) ORDER BY LEAST(receiver_id, sender_id), GREATEST(receiver_id, sender_id), creation_date DESC`)).rows,
    ];
    let chats_parsed = [];
    for (let chat of chats) {
        // user chat id
        const user = await db.query(`SELECT * FROM users WHERE id = '${chat.user_id}'`);
        // get last message
        const messages = await db.query(`SELECT * FROM messages WHERE id = '${chat.id}'`);
        // get unseen message count for receiver user being the user that made the request and sender_id the chat user id
        const unseen_count = await db.query(`SELECT count(*) FROM messages WHERE seen_date IS NULL AND sender_id = '${chat.user_id}' AND receiver_id = '${user_id}'`);
        const chat_user = new user_1.User(user.rows[0]);
        if ((user.rowCount || 0) != 0 && (messages.rowCount || 0) != 0) {
            const attachments = await get_attachments(messages.rows[0].id);
            const message = {
                ...messages.rows[0],
                attachments: attachments,
            };
            chats_parsed.push({
                user: { ...chat_user },
                last_message: message,
                unseen_message_count: (unseen_count.rowCount === 0 && 0) ||
                    unseen_count.rows[0]["count"],
            });
        }
    }
    return chats_parsed;
}
async function check_message_permission(user_id, message_id) {
    const db = db_1.ChatAppDatabase.getInstance();
    const messages = (await db.query_db(`SELECT * FROM messages WHERE id = '${message_id}'`)).rows;
    if (messages.length === 0)
        throw new Error("message not found");
    return (messages[0].sender_id === user_id || messages[0].receiver_id === user_id);
}
async function get_single_message(user_id, message_id) {
    const db = db_1.ChatAppDatabase.getInstance();
    const messages = (await db.query_db(`SELECT * FROM messages WHERE id = '${message_id}' AND (sender_id = '${user_id}' OR receiver_id = '${user_id}')`)).rows;
    if (messages.length === 0)
        throw new Error(constants_1.error_map.db_not_found.error_msg);
    return await parse_message(messages[0]);
}
async function get_attachments(message_id) {
    const db = await db_1.ChatAppDatabase.getInstance().initDB();
    const query = await db.query(`SELECT * FROM attachments WHERE message_id = '${message_id}'`);
    return query.rows;
}
async function update_attachment(query) {
    const db = db_1.ChatAppDatabase.getInstance();
    await db.exec_db(query);
}
async function create_message(message) {
    const db = db_1.ChatAppDatabase.getInstance();
    if (message.attachments.length > 0) {
        await db.exec_db(new message_1.Message({ ...message }).toInsert());
        await db.exec_db((0, functions_1.parse_attachments_to_insert)(message.attachments.map((a) => a.toInsertValues())));
    }
    else {
        await db.exec_db(message.toInsert());
    }
}
async function patch_message(params) {
    const db = db_1.ChatAppDatabase.getInstance();
    console.log(message_1.Message.toUpdate(params));
    await db.exec_db(message_1.Message.toUpdate(params));
}
async function delete_message(user_id, message_id) {
    const db = db_1.ChatAppDatabase.getInstance();
    const message = await get_single_message(user_id, message_id);
    if (message.attachments.length > 0) {
        const path = message.attachments[0].path;
        let message_path = path.substring(0, path.lastIndexOf("/"));
        await fs_1.default.promises.rmdir(message_path, { recursive: true });
    }
    await db.exec_db(message_1.Message.toDelete(message_id));
}
