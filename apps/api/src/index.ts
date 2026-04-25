import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import path from 'path';

// Forzar carga de .env desde la raíz de la API
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { getDailyReport } from './controllers/reportsController';
import { createSale } from './controllers/salesController';
import { getCurrentShift, openShift, closeShift } from './controllers/shiftController';
import { getAllShifts, getShiftReport } from './controllers/shiftReportController';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.get('/api/reports/daily', getDailyReport);
app.get('/api/reports/shift/:shiftId', getShiftReport);
app.post('/api/sales', createSale);

// Rutas de Turnos
app.get('/api/shifts', getAllShifts);
app.get('/api/shifts/current', getCurrentShift);
app.post('/api/shifts/open', openShift);
app.post('/api/shifts/close', closeShift);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: !!process.env.DATABASE_URL });
});

app.listen(port, () => {
  console.log(`🚀 DulceMar API en puerto ${port}`);
});

export { prisma };
