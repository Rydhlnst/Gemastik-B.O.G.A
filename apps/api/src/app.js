import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import routes from './routes/index.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pino());

// Routes
app.use('/api', routes);

export default app;
