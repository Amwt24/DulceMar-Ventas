const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    const users = await prisma.user.count();
    const sales = await prisma.sale.count();
    const lastSales = await prisma.sale.findMany({
      take: 5,
      include: { user: true }
    });
    
    console.log('--- ESTADO DE SUPABASE ---');
    console.log(`Usuarios registrados: ${users}`);
    console.log(`Ventas totales: ${sales}`);
    console.log('Últimas 5 ventas:', JSON.stringify(lastSales, null, 2));
  } catch (e) {
    console.error('Error al conectar con Supabase:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
