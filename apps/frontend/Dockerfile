# Multi-stage Dockerfile para o Frontend FisioPro
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos de build para API em produção
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

# Nginx Alpine para servir o SPA com compressão e rewrites
FROM nginx:1.25-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
