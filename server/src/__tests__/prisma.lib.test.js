describe('prisma.js — parâmetros PgBouncer', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  test('injeta pgbouncer=true mesmo sem o parâmetro na DATABASE_URL', () => {
    process.env.DATABASE_URL =
      'postgresql://user:pass@host:6543/db?sslmode=require'

    jest.mock('@prisma/client', () => ({
      PrismaClient: jest.fn().mockImplementation(({ datasources }) => ({
        _url: datasources.db.url,
      })),
    }))

    const instance = require('../lib/prisma')
    const url = new URL(instance._url)

    expect(url.searchParams.get('pgbouncer')).toBe('true')
    expect(url.searchParams.get('statement_cache_size')).toBe('0')
    expect(url.searchParams.get('connection_limit')).toBe('1')
  })

  test('sobrescreve valores incorretos na DATABASE_URL', () => {
    process.env.DATABASE_URL =
      'postgresql://user:pass@host:6543/db?pgbouncer=false&statement_cache_size=10&connection_limit=5'

    jest.mock('@prisma/client', () => ({
      PrismaClient: jest.fn().mockImplementation(({ datasources }) => ({
        _url: datasources.db.url,
      })),
    }))

    const instance = require('../lib/prisma')
    const url = new URL(instance._url)

    expect(url.searchParams.get('pgbouncer')).toBe('true')
    expect(url.searchParams.get('statement_cache_size')).toBe('0')
    expect(url.searchParams.get('connection_limit')).toBe('1')
  })
})
