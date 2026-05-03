import { Request, Response } from 'express';
import { prisma } from '../index';

// Asegurar categoría General (usada por defecto)
const ensureDefaultCategory = async () => {
  let category = await prisma.category.findFirst({ where: { name: 'General' } });
  if (!category) {
    category = await prisma.category.create({ data: { name: 'General' } });
  }
  return category;
};

// GET /api/products — Lista todos los productos activos, ordenados por sortOrder luego createdAt
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json(products);
  } catch (error: any) {
    console.error('❌ Error en getProducts:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/products — Crear producto (solo admin)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, emoji, price, unit, presetPrices } = req.body;
    if (!name || !emoji) {
      return res.status(400).json({ error: 'Nombre e icono requeridos' });
    }

    const category = await ensureDefaultCategory();

    // sortOrder: poner al final
    const maxOrder = await prisma.product.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const product = await prisma.product.create({
      data: {
        name,
        emoji,
        price: Number(price) || 1.0,
        unit: unit || 'u',
        categoryId: category.id,
        sortOrder: nextOrder,
        ...(presetPrices && { presetPrices }),
      },
    });
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un producto con ese nombre' });
    }
    console.error('❌ Error en createProduct:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/products/:id — Editar producto (solo admin)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, emoji, price, unit, presetPrices } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(emoji && { emoji }),
        ...(price !== undefined && { price: Number(price) }),
        ...(unit && { unit }),
        ...(presetPrices !== undefined && { presetPrices }),
      },
    });
    res.json(product);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    console.error('❌ Error en updateProduct:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/products/:id — Desactivar producto (soft delete, solo admin)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ ok: true });
  } catch (error: any) {
    console.error('❌ Error en deleteProduct:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/products/reorder — Actualizar el orden de los productos
// Body: { ids: string[] }  (lista ordenada de IDs)
export const reorderProducts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids debe ser un array' });
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.product.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    res.json({ ok: true });
  } catch (error: any) {
    console.error('❌ Error en reorderProducts:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/products/seed — Inserta los productos iniciales si la tabla está vacía
export const seedProducts = async (req: Request, res: Response) => {
  try {
    const count = await prisma.product.count();
    if (count > 0) {
      return res.json({ message: 'Los productos ya existen', count });
    }

    const category = await ensureDefaultCategory();

    const initialProducts = [
      { name: 'Banano', emoji: '🍌', price: 1.0 },
      { name: 'Sandía', emoji: '🍉', price: 1.0 },
      { name: 'Verde Barraganete', emoji: '🍌', price: 1.0 },
      { name: 'Melón', emoji: '🍈', price: 1.0 },
      { name: 'Piña', emoji: '🍍', price: 1.0 },
      { name: 'Papas', emoji: '🥔', price: 1.0 },
      { name: 'Zapotes', emoji: '🥭', price: 1.0 },
      { name: 'Naranjas', emoji: '🍊', price: 1.0 },
      { name: 'Plátano Maduro', emoji: '🍌', price: 1.0 },
      { name: 'Yuca Amarilla', emoji: '🍠', price: 1.0 },
      { name: 'Yuca Blanca', emoji: '🦴', price: 1.0 },
      { name: 'Cocos', emoji: '🥥', price: 1.0 },
    ];

    const products = await prisma.$transaction(
      initialProducts.map((p, index) =>
        prisma.product.create({
          data: { ...p, unit: 'u', categoryId: category.id, sortOrder: index },
        })
      )
    );

    res.json({ message: `✅ ${products.length} productos creados`, products });
  } catch (error: any) {
    console.error('❌ Error en seedProducts:', error.message);
    res.status(500).json({ error: error.message });
  }
};
