"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const url_1 = require("url");
const auth_1 = require("./types/auth");
const messages_1 = require("./utils/functions/messages");
const constants_1 = require("./utils/constants");
const jsonwebtoken_1 = require("jsonwebtoken");
const functions_1 = require("./utils/functions");
// Create an HTTP server
const server = http_1.default.createServer();
// Create a WebSocket server instance
const ws_server = new ws_1.WebSocketServer({ server });
// Handle different paths
ws_server.on("connection", function connection(ws, request) {
    const { url } = request;
    if (!url)
        return;
    const query = (0, url_1.parse)(url, true).query;
    const token = query.token;
    try {
        const verified_token = auth_1.Auth.verify_auth_token((token || "").toString());
        const user_id = new auth_1.Auth({ token: verified_token }).user_id;
        if (url.startsWith("/api/messages/listen")) {
            const receiver_id = query.receiver_id;
            if (!receiver_id) {
                ws.send("receiver id must not be empty");
                return;
            }
            let listener = async (args) => {
                // must be receiver id on opt
                try {
                    const messages = await (0, messages_1.get_messages)(user_id, receiver_id.toString());
                    return ws.send(JSON.stringify(messages));
                }
                catch (err) {
                    console.log(err.message);
                }
            };
            constants_1.EVENT_EMITTER.on(`update-${(0, functions_1.get_users_chat_id)(receiver_id.toString(), user_id)}`, listener);
            ws.on("close", () => {
                constants_1.EVENT_EMITTER.off(`update-${(0, functions_1.get_users_chat_id)(receiver_id.toString(), user_id)}`, listener);
                console.log(`Closed message connection for ${user_id}`);
            });
        }
        else if (url.startsWith("/api/chats/listen")) {
            let listener = async () => {
                try {
                    const chats = await (0, messages_1.get_chats)(user_id);
                    return ws.send(JSON.stringify(chats));
                }
                catch (err) {
                    console.log(err.message);
                }
            };
            let event = "";
            constants_1.EVENT_EMITTER.onAny((_event) => {
                if (_event.toString().startsWith("update-") &&
                    _event.includes(user_id)) {
                    listener();
                    event = _event.toString();
                }
            });
            ws.on("close", () => {
                constants_1.EVENT_EMITTER.off(event, listener);
                // EVENT_EMITTER.removeListener(`update-*${user_id}*`, listener);
                console.log(`Closed message connection for ${user_id}`);
            });
        }
        else {
            ws.close(1000, "Path not handled");
        }
        ws.on("error", (err) => {
            console.log(err.message);
        });
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.JsonWebTokenError &&
            err.message.toLowerCase().includes("malformed")) {
            ws.send("invalid token");
        }
        else if (err instanceof jsonwebtoken_1.JsonWebTokenError &&
            err.message.toLowerCase().includes("malformed")) {
            ws.send("expired token");
        }
        else
            ws.close();
    }
});
exports.default = server;
