

export const CREATE_USER_TABLE = `CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY NOT NULL, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password TEXT NOT NULL)`;

export const CREATE_MESSAGE_TABLE = `CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY NOT NULL, content TEXT NOT NULL, date BIGINT NOT NULL, sender_id TEXT NOT NULL REFERENCES users(id), receiver_id TEXT NOT NULL REFERENCES users(id))`;

export const CREATE_AUTH_TABLE = `CREATE TABLE IF NOT EXISTS auth(token TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id))`;

export const USERNAME_VALIDATION_REGEX = `^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$`;

export const error_map = {
  username_already_exists: {
    error_msg: 'duplicate key value violates unique constraint "users_username_key"',
    error_obj: {
      type: "username_already_exists_error",
      path: "username",
      location: "body",
      msg: "this username already exists"
    }
  },
  invalid_credentials: {
    error_msg: 'invalid user credentials',
    error_obj: {
      type: "invalid_credentials",
      path: "password",
      location: "body",
      msg: "invalid password"
    }
  },
  user_already_logged_in: {
    error_msg: 'duplicate key value violates unique constraint "auth_pkey"',
    error_obj: {
      type: "user_already_logged",
      msg: "user already logged in"
    }
  },
  // Additional errors can be added here
};
