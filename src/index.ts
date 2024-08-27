import express from 'express';
import cors from 'cors';
import { loggin_middleware } from './utils/middlewares/middlewares';
import dotenv from 'dotenv';
import main_router from './routes/main';

dotenv.config();

const PORT = process.env.PORT || 5500;

const app = express();

app.use(express.json());
app.use(cors());
app.use(loggin_middleware);
app.use(main_router);

app.listen(PORT, ()=>{
	console.log(`Listening on port ${PORT}`);
});
