import { Request, Response } from 'express';
import { prisma } from '../index';

export const getCurrentShift = async (req: Request, res: Response) => {
  try {
    const shift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
      orderBy: { openedAt: 'desc' }
    });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener turno' });
  }
};

export const openShift = async (req: Request, res: Response) => {
  try {
    const { vendorName } = req.body;
    const existing = await prisma.shift.findFirst({ where: { status: 'OPEN' } });
    if (existing) return res.status(400).json({ error: 'Ya hay un turno abierto' });

    const shift = await prisma.shift.create({
      data: { openedBy: vendorName, status: 'OPEN' }
    });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: 'Error al abrir turno' });
  }
};

export const closeShift = async (req: Request, res: Response) => {
  try {
    const { vendorName } = req.body;
    const shift = await prisma.shift.findFirst({ where: { status: 'OPEN' } });
    if (!shift) return res.status(400).json({ error: 'No hay turno abierto' });

    // Calcular total del turno
    const sales = await prisma.sale.aggregate({
      where: { createdAt: { gte: shift.openedAt } },
      _sum: { total: true }
    });

    const updated = await prisma.shift.update({
      where: { id: shift.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: vendorName,
        totalSales: sales._sum.total || 0
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar turno' });
  }
};
