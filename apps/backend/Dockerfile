# Multi-stage Dockerfile para o Backend FisioPro
FROM node:20-alpine AS builder

WORKDIR /app

# Copia manifestos de dependência
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/

# Instala dependências
RUN npm ci

# Copia código fonte do backend e prisma schema
COPY apps/backend ./apps/backend

# Gera cliente Prisma e compila TypeScript
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

# Runner de Produção
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3333

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

RUN npm ci --omit=dev --workspace=backend

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3333

CMD ["node", "apps/backend/dist/server.js"]

