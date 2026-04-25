import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAllShifts = async (req: Request, res: Response) => {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { openedAt: 'desc' },
      take: 20
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial de turnos' });
  }
};

export const getShiftReport = async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId }
    });

    if (!shift) return res.status(404).json({ error: 'Turno no encontrado' });

    const endTime = shift.closedAt || new Date();

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: shift.openedAt,
          lte: endTime
        },
      },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    const productReport: Record<string, any> = {};
    const vendorReport: Record<string, any> = {};
    let grandTotal = 0;

    sales.forEach((sale) => {
      grandTotal += Number(sale.total);
      
      const vendorId = sale.userId;
      if (!vendorReport[vendorId]) {
        vendorReport[vendorId] = { name: sale.user.name, total: 0, count: 0 };
      }
      vendorReport[vendorId].total += Number(sale.total);
      vendorReport[vendorId].count += 1;

      sale.items.forEach((item) => {
        const productId = item.productId;
        if (!productReport[productId]) {
          productReport[productId] = {
            name: item.product.name,
            emoji: item.product.emoji,
            total: 0,
            count: 0,
          };
        }
        productReport[productId].total += Number(item.price);
        productReport[productId].count += Number(item.quantity);
      });
    });

    res.json({
      grandTotal,
      products: Object.values(productReport).sort((a, b) => b.total - a.total),
      vendors: Object.values(vendorReport).sort((a, b) => b.total - a.total),
      shiftInfo: shift
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte de turno' });
  }
};
