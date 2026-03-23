# ---------- Base image ----------
# FROM node:20-alpine AS deps
# RUN npm install -g pnpm
# WORKDIR /app
# COPY package.json pnpm-lock.yaml ./
# RUN pnpm install --frozen-lockfile

# FROM node:20-alpine AS builder
# RUN npm install -g pnpm
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# RUN pnpm build          # ← THIS compiles TypeScript to dist/

# FROM node:20-alpine AS runner
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./
# ENV NODE_ENV=production
# EXPOSE 3000
# CMD ["node", "dist/src/server.js"]

FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]
