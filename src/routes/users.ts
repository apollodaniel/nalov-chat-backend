import { Router } from "express";
import { auth_validation_middleware } from "../utils/middlewares/validation_middleware";
import { users_get_middleware, users_get_single_middleware } from "../utils/middlewares/users";
import { checkSchema } from "express-validator";
import { USER_GET_SINGLE_VALIDATION_SCHEMA } from "../utils/validation_schemas/user_validation";

const router = Router();

router.get(
	'/api/users',
	auth_validation_middleware,
	users_get_middleware
)


router.get(
	'/api/users/:id',
	checkSchema(USER_GET_SINGLE_VALIDATION_SCHEMA),
	auth_validation_middleware,
	users_get_single_middleware
)

export default router;
