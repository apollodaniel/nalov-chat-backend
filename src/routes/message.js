"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const message_validation_1 = require("../utils/validation_schemas/message_validation");
const validation_middleware_1 = require("../utils/middlewares/validation_middleware");
const message_1 = require("../utils/middlewares/message");
const router = (0, express_1.Router)();
router.get("/api/messages", (0, express_validator_1.checkSchema)(message_validation_1.MESSAGE_GET_VALIDATION), validation_middleware_1.auth_validation_middleware, message_1.message_get_middleware);
// listen messages
// router.get(
// 	"/api/messages/listen",
// 	auth_validation_middleware,
// 	message_listen_middleware,
// );
// get message attachments
router.get("/api/messages/:id/attachments", (0, express_validator_1.checkSchema)(message_validation_1.MESSAGE_GET_ATTACHMENTS_VALIDATION), validation_middleware_1.auth_validation_middleware, message_1.message_get_attachments_middleware);
router.get("/api/messages/:id", (0, express_validator_1.checkSchema)(message_validation_1.MESSAGE_GET_SINGLE_VALIDATION), validation_middleware_1.auth_validation_middleware, message_1.message_get_single_middleware);
router.put("/api/messages", (0, express_validator_1.checkSchema)(message_validation_1.MESSAGE_PUT_VALIDATION), validation_middleware_1.auth_validation_middleware, message_1.message_put_middleware);
router.patch("/api/messages/:id", (0, express_validator_1.checkSchema)(message_validation_1.MESSAGE_PATCH_VALIDATION), validation_middleware_1.auth_validation_middleware, message_1.message_patch_middleware);
router.delete("/api/messages/:id", (0, express_validator_1.checkSchema)(message_validation_1.MESSAGE_DELETE_SINGLE_VALIDATION), validation_middleware_1.auth_validation_middleware, message_1.message_delete_middleware);
router.get("/api/chats", validation_middleware_1.auth_validation_middleware, message_1.chats_get_middleware);
// router.get(
// 	"/api/chats/listen",
// 	auth_validation_middleware,
// 	chat_listen_middleware,
// );
//
exports.default = router;
