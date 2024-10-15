"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const message_1 = __importDefault(require("./message"));
const users_1 = __importDefault(require("./users"));
const static_files_1 = __importDefault(require("./static_files"));
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.use(message_1.default);
router.use(users_1.default);
router.use(static_files_1.default);
exports.default = router;
