FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para Prisma
RUN apt-get update -y && apt-get install -y openssl libssl-dev

COPY package*.json ./
COPY src/prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate --schema ./src/prisma/schema.prisma
RUN npm run build

FROM node:20-slim

WORKDIR /app

# Instalar openssl en la imagen final
RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
