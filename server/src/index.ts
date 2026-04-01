import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { personsRouter } from './routes/persons';
import { firearmsRouter } from './routes/firearms';
import { permitsRouter } from './routes/permits';
import { licensesRouter } from './routes/licenses';
import { transactionsRouter } from './routes/transactions';
import { dealersRouter } from './routes/dealers';
import { reportsRouter } from './routes/reports';
import { serializationRouter } from './routes/serialization';
import { searchRouter } from './routes/search';
import { adminRouter } from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// API routes
app.use('/api/persons',       personsRouter);
app.use('/api/firearms',      firearmsRouter);
app.use('/api/permits',       permitsRouter);
app.use('/api/licenses',      licensesRouter);
app.use('/api/transactions',  transactionsRouter);
app.use('/api/dealers',       dealersRouter);
app.use('/api/reports',       reportsRouter);
app.use('/api/serialization', serializationRouter);
app.use('/api/search',        searchRouter);
app.use('/api/admin',         adminRouter);

app.listen(PORT, () => {
  console.log(`MIRCS API running at http://localhost:${PORT}`);
});

export default app;
