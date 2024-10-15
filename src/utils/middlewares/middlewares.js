"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggin_middleware = loggin_middleware;
function loggin_middleware(req, resp, next) {
    console.log(`${req.ip} - ${req.method} - ${req.path}`);
    next();
}
