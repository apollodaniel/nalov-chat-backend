"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../utils/middlewares/validation_middleware");
const users_1 = require("../utils/middlewares/users");
const express_validator_1 = require("express-validator");
const user_validation_1 = require("../utils/validation_schemas/user_validation");
const user_patch_middleware_1 = require("../utils/middlewares/user_patch_middleware");
const router = (0, express_1.Router)();
router.get("/api/users", (0, express_validator_1.checkSchema)(user_validation_1.USERS_GET_VALIDATION_SCHEMA), validation_middleware_1.auth_validation_middleware, users_1.users_get_middleware);
router.get("/api/users/current", validation_middleware_1.auth_validation_middleware, users_1.get_current_user_middleware);
router.get("/api/users/:id", (0, express_validator_1.checkSchema)(user_validation_1.USER_GET_SINGLE_VALIDATION_SCHEMA), validation_middleware_1.auth_validation_middleware, users_1.users_get_single_middleware);
router.patch("/api/users/current", (0, express_validator_1.checkSchema)(user_validation_1.USER_PATCH_SINGLE_VALIDATION_SCHEMA), validation_middleware_1.auth_validation_middleware, user_patch_middleware_1.user_patch_middleware, (req, resp) => {
    return resp.sendStatus(200);
});
exports.default = router;
