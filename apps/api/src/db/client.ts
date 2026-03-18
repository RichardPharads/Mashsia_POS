import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema/'

// ── Main connection pool (read + write) ────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,              // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const db = drizzle(pool, { schema })

// ── Read-only pool for AI text-to-SQL queries ──────────────────────────────
// This user has only SELECT privileges — safe for AI-generated queries
const readOnlyPool = new Pool({
  connectionString: process.env.AI_DATABASE_URL ?? process.env.DATABASE_URL,
  max: 5,
})

export const dbReadOnly = drizzle(readOnlyPool, { schema })

// ── Health check ───────────────────────────────────────────────────────────
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