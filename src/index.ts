import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mainRouter from './modules/main';
import wsServer from './modules/sockets/sockets.server';
import cookieParser from 'cookie-parser';
import { loggingMiddleware } from './modules/shared/logging.middlewares';
import { AppDataSource } from './data-source';

dotenv.config();

const PORT = process.env.PORT || 8751;

const app = express();

app.use(
	cors({
		credentials: true,
		origin: function (origin, callback) {
			callback(null, true);
		},
	}),
);
app.use(cookieParser(process.env.COOKIES_SECRET!) as any);
app.use(express.json());

app.use(loggingMiddleware);
app.use(mainRouter);

AppDataSource.initialize()
	.then(() => {
		console.log('Initialized AppDataSource');
		app.listen(PORT, () => {
			console.log(`Listening on port ${PORT}`);
		});

		// Start the WebSocket server
		wsServer.listen(8081, () => {
			console.log('WS Server listening on port 8081');
		});
	})
	.catch((err) => {
		console.log(err.message);
	});
