import { Router } from "express";
import { checkSchema } from "express-validator";
import { MESSAGE_GET_SINGLE_VALIDATION, MESSAGE_GET_VALIDATION, MESSAGE_PATCH_VALIDATION, MESSAGE_PUT_VALIDATION } from "../utils/validation_schemas/message_validation";
import { auth_validation_middleware } from "../utils/middlewares/validation_middleware";
import { chats_get_middleware, message_get_middleware, message_get_single_middleware, message_listen_middleware, message_patch_middleware, message_put_middleware } from "../utils/middlewares/message";

const router = Router();

router.get(
	"/api/messages",
	checkSchema(MESSAGE_GET_VALIDATION),
	auth_validation_middleware,
	message_get_middleware
);

// listen messages
router.get(
	"/api/messages/listen",
	auth_validation_middleware,
	message_listen_middleware
);

router.get(
	"/api/messages/:id",
	checkSchema(MESSAGE_GET_SINGLE_VALIDATION),
	auth_validation_middleware,
	message_get_single_middleware
);

router.put(
	"/api/messages",
	checkSchema(MESSAGE_PUT_VALIDATION),
	auth_validation_middleware,
	message_put_middleware
);


router.patch(
	"/api/messages/:id",
	checkSchema(MESSAGE_PATCH_VALIDATION),
	auth_validation_middleware,
	message_patch_middleware
);

router.delete(
	"/api/messages/:id",
	checkSchema(MESSAGE_GET_SINGLE_VALIDATION),
	auth_validation_middleware,
	message_get_single_middleware
);

router.get(
	"/api/chats",
	auth_validation_middleware,
	chats_get_middleware
)



export default router;
