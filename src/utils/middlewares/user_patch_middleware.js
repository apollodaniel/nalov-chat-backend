"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_patch_middleware = user_patch_middleware;
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../../types/auth");
const user_1 = require("../../types/user");
const db_1 = require("../db");
const receive_file_middleware_1 = require("./receive_file_middleware");
function user_patch_middleware(req, resp, next) {
    if (!req.headers['content-type'] ||
        !req.headers['content-type']?.startsWith('multipart/form-data'))
        return resp.sendStatus(400);
    const auth = req.auth;
    const auth_obj = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(auth) });
    const user_id = auth_obj.user_id;
    let file_path = './public/profile-picture/';
    if (!fs_1.default.existsSync(file_path))
        fs_1.default.mkdirSync(file_path);
    const boundary = req.headers['content-type']
        .split(';')[1]
        .replace('boundary=', '')
        .trim();
    let filename = `${user_id}.png`;
    let profilePictureFileStream = fs_1.default.createWriteStream((0, path_1.join)(file_path, filename), {
        encoding: 'binary',
        flags: 'a',
    });
    req.on('data', async (data) => {
        let buffer = Buffer.from(data);
        await parseChunk(boundary, profilePictureFileStream, buffer, user_id);
    });
    req.on('error', () => {
        profilePictureFileStream.end();
        return resp.sendStatus(500);
    });
    req.on('end', () => {
        profilePictureFileStream.end();
        return resp.sendStatus(200);
    });
}
async function parseChunk(boundary, filestream, buffer, user_id) {
    const buffer_str = buffer.toString('binary');
    let buffer_content = Buffer.copyBytesFrom(buffer);
    const boundaryMatches = Array.from(buffer_str.matchAll(new RegExp(`-*${boundary}-*`, 'g')));
    let matchedBoundaries = boundaryMatches.map((match) => match[0]);
    let boundaryOcurrences = boundaryMatches.map((match) => match.index);
    // check if this is name field
    const userNameMatch = buffer_str.match(/name="userName"/) || [];
    if (userNameMatch.length !== 0) {
        buffer_content = buffer.slice(boundaryOcurrences[1], buffer.byteLength);
        const name = buffer
            .slice(buffer_str.indexOf(userNameMatch[0]) +
            userNameMatch[0].length, boundaryOcurrences[1]
            ? boundaryOcurrences[1]
            : buffer.byteLength)
            .toString('binary')
            .replace('\n', '')
            .replace('\r', '')
            .trim();
        patch_user_name(user_id, name);
        matchedBoundaries = matchedBoundaries.filter((i, _index) => _index > 0);
        boundaryOcurrences = boundaryOcurrences.filter((i, _index) => _index > 0);
    }
    const headerEndIndex = (0, receive_file_middleware_1.getChunkHeaderEndIndex)(buffer_content);
    // write files
    if (headerEndIndex != -1) {
        fs_1.default.writeFileSync(filestream.path, '');
        patch_user_profile_picture(user_id);
        const end = boundaryOcurrences[1] || buffer.byteLength;
        const content = buffer_content.slice(headerEndIndex, end);
        filestream.write(content);
    }
    else {
        // raw file content
        filestream.write(buffer.slice(0, boundaryOcurrences[0]
            ? boundaryOcurrences[0]
            : buffer.byteLength));
    }
}
async function patch_user_name(user_id, name) {
    const db = db_1.ChatAppDatabase.getInstance();
    await db.exec_db(user_1.User.toPatch(user_id, {
        name: name,
    }));
}
async function patch_user_profile_picture(user_id) {
    const db = db_1.ChatAppDatabase.getInstance();
    await db.exec_db(user_1.User.toPatch(user_id, {
        profile_picture: (0, path_1.join)(`public/profile-pictures`, `${user_id}.png`),
    }));
}
