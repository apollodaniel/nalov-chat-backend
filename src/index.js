"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const middlewares_1 = require("./utils/middlewares/middlewares");
const dotenv_1 = __importDefault(require("dotenv"));
const main_1 = __importDefault(require("./routes/main"));
const sockets_1 = __importDefault(require("./sockets"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5500;
// Create WebSocket server instances
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ credentials: true, origin: 'http://localhost:5173' }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(middlewares_1.loggin_middleware);
app.use(main_1.default);
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
// Start the HTTP server
sockets_1.default.listen(8081, () => {
    console.log('Server is listening on port 8081');
});
