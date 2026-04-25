import { Request, Response } from 'express';
import { prisma } from '../index';

export const createSale = async (req: Request, res: Response) => {
  try {
    const { total, items, vendorName } = req.body;
    
    if (!vendorName || !items) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // 1. Asegurar Vendedor
    const userEmail = `${vendorName.toLowerCase().replace(/\s/g, '')}@dulcemar.com`;
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: vendorName },
      create: {
        email: userEmail,
        password: 'default-password',
        name: vendorName,
      }
    });

    // 2. Asegurar Categoría (Prisma requiere que el producto tenga categoría)
    let category = await prisma.category.findFirst({ where: { name: 'General' } });
    if (!category) {
      category = await prisma.category.create({ data: { name: 'General' } });
    }

    // 3. Crear productos si no existen y luego la venta
    // Usamos una transacción para asegurar que todo se guarde bien
    const result = await prisma.$transaction(async (tx) => {
      const itemsWithProducts = await Promise.all(items.map(async (item: any) => {
        const product = await tx.product.upsert({
          where: { name: item.name || `Prod-${item.productId}` },
          update: {},
          create: {
            name: item.name || `Prod-${item.productId}`,
            emoji: item.emoji || '📦',
            price: Number(item.price),
            unit: 'u',
            categoryId: category!.id
          }
        });
        return {
          productId: product.id,
          quantity: 1,
          price: Number(item.price)
        };
      }));

      return await tx.sale.create({
        data: {
          total: Number(total),
          userId: user.id,
          items: {
            create: itemsWithProducts
          }
        }
      });
    });

    res.json(result);
  } catch (error: any) {
    console.error('❌ Error en createSale:', error.message);
    res.status(500).json({ error: error.message });
  }
};
