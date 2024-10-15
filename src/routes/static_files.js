"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../utils/middlewares/validation_middleware");
const receive_file_middleware_1 = require("../utils/middlewares/receive_file_middleware");
const router = express_1.default.Router();
// router.use("/files", auth_validation_middleware);
// router.use("/files", static_files_middleware);
router.use("/files", express_1.default.static('files/'));
router.use("/public/profile-pictures", express_1.default.static('public/profile-picture'));
router.post("/api/upload", validation_middleware_1.auth_validation_middleware, receive_file_middleware_1.receive_file_middleware, (req, resp) => {
    return resp.sendStatus(204);
});
exports.default = router;
