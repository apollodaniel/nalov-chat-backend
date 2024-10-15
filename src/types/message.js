"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attachment = exports.Message = void 0;
const uuid_1 = require("uuid");
class Message {
    id;
    content;
    creation_date;
    last_modified_date;
    sender_id;
    receiver_id;
    seen_date;
    // internal acess only
    attachments;
    constructor(obj) {
        if (obj.id)
            this.id = obj.id;
        else
            this.id = (0, uuid_1.v4)();
        this.creation_date = obj.creation_date;
        this.last_modified_date = obj.last_modified_date;
        this.content = obj.content;
        this.sender_id = obj.sender_id;
        this.receiver_id = obj.receiver_id;
        this.seen_date = obj.seen_date;
        this.attachments = obj.attachments || [];
    }
    toInsert() {
        return `INSERT INTO messages(id, content, creation_date, last_modified_date, sender_id, receiver_id) values ('${this.id}', '${this.content}', ${this.creation_date}, ${this.last_modified_date}, '${this.sender_id}', '${this.receiver_id}')`;
    }
    static toDelete(id) {
        return `DELETE FROM messages WHERE id = '${id}'`;
    }
    static toUpdate({ id, last_modified_date, content, }) {
        let set_params = [];
        if (last_modified_date)
            set_params.push(`last_modified_date = ${last_modified_date}`);
        if (content)
            set_params.push(`content = '${content}'`);
        return `UPDATE messages SET ${set_params.join(", ")} WHERE id = '${id}'`;
    }
}
exports.Message = Message;
class Attachment {
    id;
    message_id;
    filename;
    mime_type;
    path;
    byte_length;
    date;
    preview_path;
    constructor(obj) {
        this.id = obj.id;
        this.message_id = obj.message_id;
        this.filename = obj.filename;
        this.mime_type = obj.mime_type;
        this.path = obj.path;
        this.byte_length = obj.byte_length;
        this.date = obj.date;
        this.preview_path = obj.preview_path;
    }
    toInsert() {
        if (this.preview_path)
            return `INSERT INTO attachments(id, message_id, filename, mime_type, path, preview_path, byte_length) values ('${this.id}','${this.message_id}', '${this.filename}', '${this.mime_type}', '${this.path}', '${this.preview_path}', ${this.byte_length}, ${this.date})`;
        return `INSERT INTO attachments(id, message_id, filename, mime_type, path, byte_length) values ('${this.id}','${this.message_id}', '${this.filename}', '${this.mime_type}', '${this.path}', ${this.byte_length}, ${this.date})`;
    }
    toInsertValues() {
        return `('${this.id}','${this.message_id}', '${this.filename}', '${this.mime_type}', '${this.path}', ${this.preview_path ? `'${this.preview_path}', ` : ""} ${this.byte_length})`;
    }
    toUpdateMimeType(mimeType) {
        return `UPDATE attachments SET mime_type = '${mimeType}' WHERE id = '${this.id}'`;
    }
    toUpdatePreviewPath(preview_path) {
        return `UPDATE attachments SET preview_path = '${preview_path}' WHERE id = '${this.id}'`;
    }
    toUpdateDate(date) {
        return `UPDATE attachments SET date = ${date} WHERE id = '${this.id}'`;
    }
    static toDelete(id) {
        return `DELETE FROM attachments WHERE id = '${id}'`;
    }
}
exports.Attachment = Attachment;
