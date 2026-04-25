import { Request, Response } from 'express';
import { prisma } from '../index';

export const getDailyReport = async (req: Request, res: Response) => {
  try {
    // 1. Buscar el turno abierto actual
    const currentShift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
      orderBy: { openedAt: 'desc' }
    });

    // 2. Si no hay turno abierto, devolvemos todo en cero
    if (!currentShift) {
      return res.json({
        grandTotal: 0,
        products: [],
        vendors: [],
        noActiveShift: true,
        timestamp: new Date(),
      });
    }

    // 3. Obtener ventas SOLO desde que se abrió este turno
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: currentShift.openedAt,
        },
      },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });

    const productReport: Record<string, any> = {};
    const vendorReport: Record<string, { name: string; total: number; count: number }> = {};
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
      shiftInfo: currentShift,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error in getDailyReport:', error);
    res.status(500).json({ error: 'Error al generar el reporte del turno activo' });
  }
};
