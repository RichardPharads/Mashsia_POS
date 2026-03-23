import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema:  './src/db/schema/index.ts',
  out:     './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgres://pos:pospassword@localhost:5432/posdb',
  },
})