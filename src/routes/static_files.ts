import express, { Request, Response } from "express";
import {join} from "path";
import { static_files_middleware } from "../utils/middlewares/static_files_middleware";
import { auth_validation_middleware, validation_middleware } from "../utils/middlewares/validation_middleware";
import { receive_file_middleware } from "../utils/middlewares/receive_file_middleware";

const router = express.Router();

router.use("/attachments", auth_validation_middleware);
router.use("/attachments", static_files_middleware);
router.use("/attachments", express.static('files/'));
router.use("/public/profile-pictures", express.static('public/profile-picture'));

router.post(
	"/api/upload",
	auth_validation_middleware,
	receive_file_middleware,
	(req: Request,resp: Response)=>{
		return resp.sendStatus(204);
	}
);


export default router;
