<<<<<<< HEAD
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm globally (to match the rest of the stack)
RUN npm install -g pnpm

# Copy source (allows building even before api/package.json exists)
COPY . .

# Install dependencies only if api/package.json exists
RUN if [ -f package.json ]; then pnpm install --frozen-lockfile || pnpm install; fi

ENV NODE_ENV=production
EXPOSE 3000

# Placeholder command – replace with "pnpm start" or "node dist/server.js" once implemented
CMD ["node", "server.js"]
=======
# ---------- Base image ----------
FROM node:20-alpine AS base

RUN corepack enable
WORKDIR /app

COPY package.json ./
RUN pnpm install

COPY . .

EXPOSE 3000
CMD ["pnpm", "start"]
>>>>>>> 39748a9 (API seed updates)
