export interface IDbType {
	toInsert(): string;
	toDelete(): string;
}

export type MessageUpdateParams = {
	id: string;
	last_modified_date: number;
	content?: string;
};

export type UserCredentials = {
	username: string;
	password: string;
};

export enum UserCredentialStatus {
	UsernameNotExists,
	IncorrectPassword,
	Sucess,
}

export type AppError = {
	type: string;
	msg: string;
};

export type MessagesQuery =
	| {
			type: 'multiple';
			sender_id: string;
			receiver_id: string;
	  }
	| { type: 'single'; user_id: string; message_id: string };
