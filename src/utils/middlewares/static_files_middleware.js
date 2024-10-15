"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.static_files_middleware = static_files_middleware;
const auth_1 = require("../../types/auth");
function static_files_middleware(req, resp, next) {
    let path = req.path;
    const splitted_path = path.split("/").filter((p) => p.trim() !== "");
    const user_id = new auth_1.Auth({ token: auth_1.Auth.verify_auth_token(req.auth) }).user_id;
    return next();
    try {
        if (splitted_path.length >= 2 && splitted_path[1].includes(user_id)) {
            // user has the permission of that chat
            return next();
        }
        return resp.sendStatus(401);
    }
    catch (err) {
        console.log(err.message);
        return resp.sendStatus(500);
    }
}
