import { Router } from "express";
import { auth_validation_middleware } from "../utils/middlewares/validation_middleware";
import { get_current_user_middleware, users_get_middleware, users_get_single_middleware, users_patch_single_middleware } from "../utils/middlewares/users";
import { checkSchema } from "express-validator";
import { USER_GET_SINGLE_VALIDATION_SCHEMA, USER_PATCH_SINGLE_VALIDATION_SCHEMA } from "../utils/validation_schemas/user_validation";
import { receive_file_middleware } from "../utils/middlewares/receive_file_middleware";

const router = Router();

router.get(
	'/api/users',
	auth_validation_middleware,
	users_get_middleware
)

router.get(
	'/api/users/current',
	auth_validation_middleware,
	get_current_user_middleware
);

router.get(
	'/api/users/:id',
	checkSchema(USER_GET_SINGLE_VALIDATION_SCHEMA),
	auth_validation_middleware,
	users_get_single_middleware
)

router.patch(
	'/api/users/current',
	checkSchema(USER_PATCH_SINGLE_VALIDATION_SCHEMA),
	auth_validation_middleware,
	receive_file_middleware({is_profile_picture: true}),
	users_patch_single_middleware
)

export default router;
