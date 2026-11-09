# Multi-stage Dockerfile para o Backend FisioPro
FROM node:20-alpine AS builder

# Instala OpenSSL necessário para o Query Engine do Prisma no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copia manifestos de dependência do backend
COPY package*.json ./

# Instala dependências (incluindo devDependencies necessárias para compilação)
RUN npm install

# Copia prisma schema e gera o cliente Prisma para Alpine Linux
COPY prisma ./prisma
RUN npx prisma generate

# Copia arquivos de configuração e código fonte TypeScript
COPY tsconfig.json ./
COPY src ./src

# Compila o backend para JavaScript (dist/)
RUN npm run build

# -----------------------------------------------------------
# Runner de Produção Leve
# -----------------------------------------------------------
FROM node:20-alpine AS runner

# Instala OpenSSL para execução do Prisma Client em runtime
RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3333

# Copia manifesto e instala somente dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copia build e cliente Prisma compilados
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3333

CMD ["node", "dist/server.js"]
