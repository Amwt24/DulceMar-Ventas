import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes placeholders
app.use('/api/auth', (req, res) => res.json({ message: 'Auth route' }));
app.use('/api/products', (req, res) => res.json({ message: 'Products route' }));
app.use('/api/sales', (req, res) => res.json({ message: 'Sales route' }));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { prisma };
