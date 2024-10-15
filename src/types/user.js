"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const uuid_1 = require("uuid");
class User {
    id;
    username;
    name;
    password;
    profile_picture;
    constructor(obj) {
        if (obj.id)
            this.id = obj.id;
        else
            this.id = (0, uuid_1.v4)();
        if (obj.profile_picture)
            this.profile_picture = obj.profile_picture;
        else
            this.profile_picture = 'public/profile-pictures/default.png';
        this.username = obj.username;
        this.name = obj.name;
        this.password = obj.password;
    }
    toInsert() {
        return `INSERT INTO users(id, username, name, password) values ('${this.id}', '${this.username}', '${this.name}', '${this.password}')`;
    }
    static toDelete(id) {
        return `DELETE FROM users WHERE id = '${id}'`;
    }
    static toPatch(id, obj) {
        let update_text = [];
        if (!obj.name && !obj.profile_picture)
            return '';
        if (obj.name)
            update_text.push(`name = '${obj.name}'`);
        if (obj.profile_picture)
            update_text.push(`profile_picture = '${obj.profile_picture}'`);
        return `UPDATE users SET ${update_text.join(", ")} WHERE id = '${id}'`;
    }
}
exports.User = User;
