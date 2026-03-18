# ---------- Base image ----------
    FROM node:20-alpine AS base
    RUN corepack enable
    WORKDIR /app
    
    # ---------- Dependencies stage ----------
    FROM base AS deps
    COPY package.json ./
    RUN pnpm install
    
    # ---------- Builder stage ----------
    FROM deps AS builder
    COPY . .
    # Build TypeScript to JavaScript
    RUN pnpm build
    
    # ---------- Production stage ----------
    FROM node:20-alpine AS runner
    RUN corepack enable
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy built files
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/dist ./dist
    # or if your build outputs to /app/src
    # COPY --from=builder /app/src ./src
    
    EXPOSE 3000
    # Point to the compiled JavaScript
    CMD ["node", "dist/server.js"]