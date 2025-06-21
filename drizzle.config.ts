import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/database/schema/index.ts',
    out: './drizzle',
    dbCredentials: {
        host: process.env.PG_HOST || 'tournament-db',
        port: parseInt(process.env.PG_PORT || '5432', 10),
        database: process.env.PG_DATABASE || 'tournament',
        user: process.env.PG_USER || 'tournament',
        password: process.env.PG_PASSWORD || 'tournament',
        ssl: false
    }
})
