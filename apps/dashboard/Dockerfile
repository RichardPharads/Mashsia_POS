# ---- Base image ----
    FROM node:20-alpine AS base

    # Enable pnpm via corepack
    RUN corepack enable
    
    # ---- Dependencies & Build ----
    FROM base AS builder
    
    WORKDIR /app
    
    # Install dependencies
    COPY package.json pnpm-lock.yaml ./
    COPY next.config.* tsconfig.json postcss.config.* tailwind.config.* ./
    COPY public ./public
    COPY src ./src
    
    RUN pnpm install --frozen-lockfile
    RUN pnpm build
    
    # ---- Runtime image ----
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    ENV NODE_ENV=production
    
    # Copy built app
    COPY --from=builder /app ./
    
    # Next.js will listen on this port
    EXPOSE 4000
    RUN corepack enable

    # Start Next.js on port 4000
    CMD ["pnpm", "start", "-p", "4000"]