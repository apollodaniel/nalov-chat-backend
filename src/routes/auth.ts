import { Request, Response, Router } from "express";
import { checkSchema } from "express-validator";
import { REGISTER_VALIDATION_SCHEMA } from "../utils/validation_schemas/register_validation";
import { validation_middleware } from "../utils/middlewares/middlewares";
import { register_middleware } from "../utils/middlewares/register_middleware";
import { LOGIN_VALIDATION_SCHEMA } from "../utils/validation_schemas/login_validation";
import { login_middleware } from "../utils/middlewares/login_middlewares";
import { token_middleware } from "../utils/middlewares/token_middleware";

const router = Router();

router.post(
	"/auth/register",
	checkSchema(REGISTER_VALIDATION_SCHEMA),
	validation_middleware,
	register_middleware
);

router.post(
	"/auth/login",
	checkSchema(LOGIN_VALIDATION_SCHEMA),
	validation_middleware,
	login_middleware
);

router.get(
	"/auth/token",
	token_middleware
)

export default router;