const { PrismaClient } = require('@prisma/client')

// Garante compatibilidade com PgBouncer mesmo que a DATABASE_URL do ambiente
// não contenha os parâmetros obrigatórios
const dbUrl = new URL(process.env.DATABASE_URL)
dbUrl.searchParams.set('pgbouncer', 'true')
dbUrl.searchParams.set('statement_cache_size', '0')
dbUrl.searchParams.set('connection_limit', '1')

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl.toString() } },
  log: ['error'],
})

module.exports = prisma
