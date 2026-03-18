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
