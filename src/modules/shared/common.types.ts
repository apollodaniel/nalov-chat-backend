export interface QueryOptions {
	limit: number; // result limit
	orderBy: string; // field to order by
	asc: boolean; // asc = true ; desc = false
}

export interface ErrorEntry {
	code: string;
	field?: string; // for the case of using it as an field error
	message: string;
	statusCode: number;
}
