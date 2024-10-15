"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAppDatabase = void 0;
const pg_1 = __importDefault(require("pg"));
const constants_1 = require("./constants");
class ChatAppDatabase {
    static _instance;
    db;
    static getInstance() {
        if (!this._instance) {
            this._instance = new ChatAppDatabase();
        }
        return this._instance;
    }
    constructor() {
        this.initDB();
    }
    async initDB() {
        if (!this.db) {
            this.db = new pg_1.default.Client({
                host: "localhost",
                port: (process.env.POSTGRES_PORT &&
                    parseInt(process.env.POSTGRES_PORT)) ||
                    undefined,
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.POSTGRES_DB,
            });
            await this.db.connect();
        }
        await this.db.query(constants_1.CREATE_USER_TABLE);
        await this.db.query(constants_1.CREATE_ATTACHMENTS_TABLE);
        await this.db.query(constants_1.CREATE_MESSAGE_TABLE);
        await this.db.query(constants_1.CREATE_AUTH_TABLE);
        return this.db;
    }
    async query_db(query) {
        const db = await this.initDB();
        return await db.query(query);
    }
    async exec_db(sql) {
        const db = await this.initDB();
        await db.query(sql);
    }
}
exports.ChatAppDatabase = ChatAppDatabase;
