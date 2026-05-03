/**
 * Script para generar todos los iconos PWA de DulceMar
 * Ejecutar: node scripts/generate-icons.js
 *
 * Requiere: npm install sharp  (solo para este script, no va al bundle)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ruta de la imagen fuente: usa DulceMar.png si existe, sino icon-source.png
const DULCEMAR = path.join(__dirname, 'DulceMar.png');
const FALLBACK = path.join(__dirname, 'icon-source.png');
const SOURCE = fs.existsSync(DULCEMAR) ? DULCEMAR : FALLBACK;
const OUTPUT_DIR = path.join(__dirname, '../apps/web/public/icons');
const PUBLIC_DIR = path.join(__dirname, '../apps/web/public');
const ASSETS_DIR = path.join(__dirname, '../apps/web/src/assets');

if (!fs.existsSync(SOURCE)) {
  console.error('❌ No se encontró imagen fuente. Coloca DulceMar.png en la carpeta scripts/');
  process.exit(1);
}

console.log(`📂 Usando imagen fuente: ${path.basename(SOURCE)}`);

const ICONS = [
  // PWA estándar
  { file: 'icon-192x192.png',          size: 192, maskable: false },
  { file: 'icon-512x512.png',          size: 512, maskable: false },
  // Maskable (con padding para Android)
  { file: 'icon-maskable-192x192.png', size: 192, maskable: true  },
  { file: 'icon-maskable-512x512.png', size: 512, maskable: true  },
];

async function generate() {
  console.log('🎨 Generando iconos PWA de DulceMar...\n');

  for (const icon of ICONS) {
    const outPath = path.join(OUTPUT_DIR, icon.file);

    if (icon.maskable) {
      // Maskable: agregar 20% de padding con fondo verde para respetar la "zona segura"
      const padded = Math.round(icon.size * 0.8);
      const padding = Math.round(icon.size * 0.1);

      await sharp(SOURCE)
        .resize(padded, padded, { fit: 'contain', background: { r: 16, g: 185, b: 129, alpha: 1 } })
        .extend({
          top: padding, bottom: padding, left: padding, right: padding,
          background: { r: 16, g: 185, b: 129, alpha: 1 }
        })
        .png()
        .toFile(outPath);
    } else {
      await sharp(SOURCE)
        .resize(icon.size, icon.size, { fit: 'cover' })
        .png()
        .toFile(outPath);
    }

    console.log(`  ✅ ${icon.file} (${icon.size}x${icon.size}${icon.maskable ? ' maskable' : ''})`);
  }

  // favicon.ico (32x32) en la raíz de public
  await sharp(SOURCE)
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
  console.log('  ✅ favicon.ico (32x32)');

  // apple-touch-icon.png (180x180) para iOS
  await sharp(SOURCE)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('  ✅ apple-touch-icon.png (180x180)');

  // Copiar al assets del frontend (usado en el Header)
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
  await sharp(SOURCE)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(ASSETS_DIR, 'dulcemar-icon.png'));
  console.log('  ✅ src/assets/dulcemar-icon.png (Header de la app)');

  console.log('\n🚀 ¡Todos los iconos generados exitosamente!');
  console.log('   Carpeta: apps/web/public/icons/');
}

generate().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
