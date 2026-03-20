// apps/api/src/db/client.ts
import { drizzle }   from 'drizzle-orm/node-postgres'
import { Pool }      from 'pg'
import * as dotenv   from 'dotenv'
import * as schema   from './schema'

// Load .env file — must be before Pool creation
dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL 
    ?? 'postgres://pos:pospassword@localhost:5432/posdb',
})

export const db = drizzle(pool, { schema })

// Read-only pool for AI text-to-SQL
const readOnlyPool = new Pool({
  connectionString: process.env.AI_DATABASE_URL ?? process.env.DATABASE_URL,
  max: 5,
})

export const dbReadOnly = drizzle(readOnlyPool, { schema })

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch {
    return false
  }
}