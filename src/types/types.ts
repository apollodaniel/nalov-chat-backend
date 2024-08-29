export interface IDbType {
	toInsert(): string;
	toDelete(): string;
}

export type MessageUpdateParams = {
	id: string,
	date?: number,
	content?: string,
};

export type UserCredentials = {
	username: string;
	password: string;
};

export type AppError = {
	type: string;
	msg: string;
};

export type MessagesQuery =
	| {
		type: "multiple";
		sender_id: string;
		receiver_id: string;
	}
	| { type: "single"; user_id: string; message_id: string };
