# ─────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src

RUN npm run prisma:generate
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: API runtime
# ─────────────────────────────────────────────
FROM node:22-alpine AS api

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/v1/health/liveness || exit 1

EXPOSE ${PORT}

CMD ["node", "dist/main"]

# ─────────────────────────────────────────────
# Stage 3: Worker runtime
# ─────────────────────────────────────────────
FROM node:22-alpine AS worker

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

CMD ["node", "dist/worker.main"]
