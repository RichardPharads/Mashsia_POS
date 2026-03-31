FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build TypeScript
RUN pnpm build

# Run migrations during build (requires database to be running)
# You'll need a build-time database connection
# Alternative: Run migrations at startup
EXPOSE 3000

# Use a startup script that runs migrations before starting the app
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]