"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_users_chat_id = get_users_chat_id;
exports.parse_attachments_to_insert = parse_attachments_to_insert;
function get_users_chat_id(user1, user2) {
    return Array.from([user1, user2]).sort().join("");
}
function parse_attachments_to_insert(attachments_values) {
    return `INSERT INTO attachments(id, message_id, filename, mime_type, path, byte_length) values ${attachments_values.join(", ")}`;
}
