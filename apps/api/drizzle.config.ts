import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema:  './src/db/schema/index.ts',
  out:     './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL! || 'postgres://pos:pospassword@localhost:5432/posdb',
    ssl: false,
  },
  // Add this to disable the studio feature
 
})