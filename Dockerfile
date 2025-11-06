# Builder stage
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Instalar dependências do sistema que podem ser necessárias (opcional)
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  build-essential \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copia package.json + package-lock.json (ou yarn.lock) e instala dependências
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Copia o restante do código
COPY . .

# Gera Prisma Client (usa prisma/schema.prisma por padrão)
RUN npx prisma generate --schema=prisma/schema.prisma

# Build do Next
RUN npm run build

# Runtime stage
FROM node:20-bullseye-slim AS runner
WORKDIR /app

# Instalar libs mínimas
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Copia apenas o necessário do builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./next.config.mjs
# Caso use tsconfig/other, copie também
COPY --from=builder /app/ ./

# Copiar o entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

# Use entrypoint to wait for DB, run prisma tasks and start app
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
