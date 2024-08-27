
export interface IDbType{
	toInsert: () => string,
	toDelete: () => string,
	toUpdate?: () => string,
}

export type UserCredentials = {
	username: string,
	password: string
};

export type AppError = {
	type: string,
	msg: string
};
