import { QueryResult } from "pg";
import {
	MessagesQuery,
	MessageUpdateParams,
	UserCredentials,
} from "../types/types";
import { ChatAppDatabase } from "./db";
import { IUser, User } from "../types/user";
import { IMessage, Message } from "../types/message";
import { Auth } from "../types/auth";
import { error_map } from "./constants";




