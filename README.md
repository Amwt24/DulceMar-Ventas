# DulceMar 🍌🥕

Aplicación mobile-first completa para registro de ventas de frutas y verduras.

## Tecnologías

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide React, Zustand, Dexie.js (Offline).
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL.
- **DevOps:** Docker, Docker Compose, Nginx, GitHub Actions.

## Estructura

- `apps/web`: Aplicación PWA (Frontend).
- `apps/api`: Servidor API (Backend).
- `nginx`: Configuración del servidor web y proxy.

## Desarrollo

1. **Instalar dependencias:**
   ```bash
   npm run install:all
   ```

2. **Configurar entorno:**
   Copia el archivo `.env.example` a `.env` en la raíz y ajusta las variables.

3. **Levantar servicios (Postgres):**
   ```bash
   docker-compose up -d postgres
   ```

4. **Correr migraciones de Prisma:**
   ```bash
   npm run prisma:migrate
   ```

5. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

## Despliegue CI/CD

El despliegue está automatizado mediante GitHub Actions. Configura los siguientes secrets en tu repositorio:
- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

## Funcionalidades Mobile-First
- Grid táctil de productos con emojis.
- Funcionamiento offline vía IndexedDB (Dexie).
- PWA instalable con manifiesto local.
- Interfaz optimizada para una mano (Bottom Nav, Bottom Sheets).
