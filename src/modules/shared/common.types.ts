export interface QueryOptions {
	limit: number; // result limit
	orderBy: string; // field to order by
	asc: boolean; // asc = true ; desc = false
}

export interface ErrorEntry {
	code: string;
	message: string;
	statusCode: number;
}
