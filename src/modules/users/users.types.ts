import { QueryOptions } from '../shared/common.types';

export interface UserQuery extends QueryOptions {
	fieldQueries: {
		field: string;
		value: string;
		strict: boolean;
		// if stricts it searches by equality
		// if not, it searches for the pattern *<value>*
	}[];
}

export const UserQueryDefaults: UserQuery = {
	asc: true,
	orderBy: 'username',
	limit: 0, // 0 means no limit
	fieldQueries: [],
};
