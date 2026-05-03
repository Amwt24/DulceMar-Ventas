# DulceMar 🍌🥕

Aplicación **mobile-first** completa para registro de ventas de frutas y verduras, diseñada para ser instalada como PWA en teléfonos Android e iOS.

---

## ✅ Estado actual — Funcionalidades implementadas

### 👥 Sistema de roles
| Usuario | Rol | Permisos |
|---|---|---|
| **Amawta** | Administrador | Todo |
| **Mary** | Administrador | Todo |
| Cualquier otro | Vendedor | Solo vender durante turno abierto |

### 📦 Gestión de productos (Admin)
- Crear, editar y desactivar productos (soft delete)
- Catálogo de **80+ emojis** organizados por categoría con búsqueda por texto
- **Precios rápidos configurables**: el admin define hasta 4 precios que aparecen como botones al vender
- **Arrastrar para reordenar**: el orden del admin es el mismo que ve el vendedor
- Los cambios se sincronizan a todos los dispositivos inmediatamente

### 🏪 Control de turnos (Admin)
- Abrir y cerrar el turno de caja
- Los vendedores **detectan automáticamente** (polling 30s) cuando el admin abre/cierra el turno
- Sin turno activo → vendedores ven pantalla de espera

### 💰 Registro de ventas (Vendedor)
- Grilla táctil de productos
- Al tocar un producto se abren los precios rápidos configurados por el admin
- Opción "Otro valor" para precios personalizados
- Las ventas se guardan local + se sincronizan a la BD

### 📊 Reportes
- **Admin**: vista consolidada de todos los vendedores con desglose por turno
- **Vendedor**: historial de sus propias ventas del turno actual
- Botón de actualización manual en historial
- Selección de turnos históricos

### 📱 PWA & Iconos
- Instalable en Android e iOS desde el navegador
- Iconos en todos los tamaños requeridos (192, 512, maskable, apple-touch, favicon)
- Modo pantalla completa en iOS con `apple-mobile-web-app-capable`
- Script `node scripts/generate-icons.js` para regenerar iconos si se cambia la imagen fuente

---

## 🧰 Tecnologías

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Zustand, Axios |
| **Backend** | Node.js, Express, Prisma ORM, PostgreSQL (Supabase) |
| **BD** | Supabase (PostgreSQL) con conexiones pooled y directas |
| **DevOps** | Docker, Docker Compose, Nginx, GitHub Actions |
| **PWA** | Vite PWA Plugin, Workbox |

---

## 📁 Estructura del proyecto

```
AppVentas/
├── apps/
│   ├── api/                   # Backend Node.js + Express + Prisma
│   │   └── src/
│   │       ├── controllers/   # salesController, productsController, etc.
│   │       ├── prisma/        # schema.prisma + migrations
│   │       └── index.ts       # Servidor principal + rutas
│   └── web/                   # Frontend React + Vite PWA
│       ├── public/
│       │   ├── icons/         # Iconos PWA (192, 512, maskable)
│       │   ├── apple-touch-icon.png
│       │   └── favicon.ico
│       └── src/
│           ├── components/    # ProductCard, SaleModal, ProductModal, Header...
│           ├── pages/         # Dashboard, History, Reports, Login
│           ├── stores/        # Zustand: productStore, salesStore, shiftStore, authStore
│           └── types/         # Tipos TypeScript compartidos
├── nginx/                     # Configuración de proxy reverso
├── scripts/
│   ├── generate-icons.js      # Genera todos los iconos PWA desde icon-source.png
│   └── icon-source.png        # Imagen fuente para los iconos
└── docker-compose.yml
```

---

## 🚀 Desarrollo local

1. **Instalar dependencias:**
   ```bash
   npm run install:all
   ```

2. **Configurar entorno:**
   Copia `.env.example` a `.env` en la raíz y ajusta las variables:
   ```
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   ```

3. **Correr migraciones de Prisma:**
   ```bash
   npm run prisma:migrate
   ```

4. **Poblar productos iniciales** (solo primera vez):
   ```bash
   # Inicia el servidor y llama el endpoint:
   curl -X POST http://localhost:3000/api/products/seed
   ```

5. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

---

## 🌐 Despliegue CI/CD

El despliegue está automatizado mediante **GitHub Actions**. Configura los siguientes secrets en tu repositorio:

| Secret | Descripción |
|---|---|
| `SSH_HOST` | IP/dominio del servidor |
| `SSH_USER` | Usuario SSH |
| `SSH_KEY` | Clave privada SSH |
| `DOCKER_USERNAME` | Docker Hub usuario |
| `DOCKER_PASSWORD` | Docker Hub contraseña |

---

## 🎨 Regenerar iconos PWA

Si quieres cambiar el icono de la app:

1. Coloca tu imagen en `scripts/icon-source.png` (PNG cuadrado, mínimo 512×512)
2. Ejecuta:
   ```bash
   node scripts/generate-icons.js
   ```
3. Todos los tamaños se generan automáticamente en `apps/web/public/icons/`

---

## 🔮 Recomendaciones para futuras mejoras

### 🔐 Seguridad y autenticación
- [ ] **Login real con contraseña**: Actualmente el login es solo por nombre. Implementar PIN de 4 dígitos o contraseña hasheada (bcrypt ya está en el package.json)
- [ ] **JWT para la API**: Agregar middleware de autenticación en los endpoints de admin (crear/editar/eliminar productos)
- [ ] **Variables de admin en BD**: En lugar de hardcodear `['amawta', 'mary']` en el frontend, leer los roles desde la base de datos

### 📸 Imágenes de productos (Opción B)
- [ ] Activar **Supabase Storage** para subir fotos reales de cada producto
- [ ] Agregar campo `imageUrl` (ya está en el schema) al modal de producto
- [ ] En `ProductCard`, mostrar `<img>` si hay URL, sino mostrar emoji
- [ ] Endpoint `POST /api/upload` con `multer` + `@supabase/supabase-js`
- [ ] Estimado: ~4 horas · Costo: gratis hasta 1 GB en Supabase

### 💰 Gestión avanzada de ventas
- [ ] **Múltiples productos por venta**: Actualmente cada venta tiene 1 producto. Permitir carrito con varios productos antes de confirmar
- [ ] **Anular ventas**: Permitir al admin cancelar una venta registrada por error
- [ ] **Cantidad variable**: En lugar de siempre `quantity: 1`, permitir ingresar cuántas unidades/kg

### 📊 Reportes avanzados
- [ ] **Gráficas de barras** por día/semana con Chart.js o Recharts
- [ ] **Exportar a PDF/Excel** el reporte de cierre de turno
- [ ] **Comparativa entre turnos**: visualizar tendencias de ventas
- [ ] **Metas diarias**: el admin establece una meta de recaudación y se muestra el progreso

### ⚡ Rendimiento y offline
- [ ] **Modo offline real**: Si el API no responde, guardar ventas localmente y sincronizar cuando vuelva la conexión
- [ ] **Notificaciones push**: Notificar al admin cuando un vendedor registra ventas (con Web Push API)
- [ ] **Caché de productos**: Los productos se guardan en localStorage para funcionar sin red

### 👥 Multi-negocio
- [ ] **Multi-tenant**: Separar los datos por negocio para poder usar la app con múltiples clientes
- [ ] **Panel de administración web** separado (no mobile) para gestión avanzada
