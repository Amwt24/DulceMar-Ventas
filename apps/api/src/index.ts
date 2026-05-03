import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { getDailyReport } from './controllers/reportsController';
import { createSale, getMySales } from './controllers/salesController';
import { getCurrentShift, openShift, closeShift } from './controllers/shiftController';
import { getAllShifts, getShiftReport } from './controllers/shiftReportController';
import { getProducts, createProduct, updateProduct, deleteProduct, seedProducts, reorderProducts } from './controllers/productsController';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Agrupamos todas las rutas bajo /api para que coincida con Nginx
const router = express.Router();

// Reportes
router.get('/reports/daily', getDailyReport);
router.get('/reports/shift/:shiftId', getShiftReport);

// Ventas
router.post('/sales', createSale);
router.get('/sales/my', getMySales);

// Turnos
router.get('/shifts', getAllShifts);
router.get('/shifts/current', getCurrentShift);
router.post('/shifts/open', openShift);
router.post('/shifts/close', closeShift);

// Productos — rutas estáticas ANTES de /:id
router.post('/products/seed', seedProducts);
router.put('/products/reorder', reorderProducts);
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', database: !!process.env.DATABASE_URL });
});

app.use('/api', router);

app.listen(port, () => {
  console.log(`🚀 DulceMar API en puerto ${port}`);
});

export { prisma };

