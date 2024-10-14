import express from 'express';
import cors from 'cors';
import { loggin_middleware } from './utils/middlewares/middlewares';
import dotenv from 'dotenv';
import main_router from './routes/main';
import { WebSocketServer } from 'ws';
import ws_server from './sockets';
import cookie_parser from 'cookie-parser';

dotenv.config();

const PORT = process.env.PORT || 5500;

// Create WebSocket server instances

const app = express();

app.use(cookie_parser());
app.use(express.json());

app.use(cors());

app.use(loggin_middleware);
app.use(main_router);

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});

// Start the HTTP server
ws_server.listen(8081, () => {
	console.log('Server is listening on port 8081');
});
