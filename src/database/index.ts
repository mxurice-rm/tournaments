import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT! as unknown as number,
  database: process.env.PG_DATABASE!,
  user: process.env.PG_USER!,
  password: process.env.PG_PASSWORD!
})

export const database = drizzle({ client: pool, schema: schema })
