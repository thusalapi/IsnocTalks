import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// The app connects through node-postgres instead of Prisma's built-in engine.
// Node falls back from IPv6 to IPv4 automatically, so this works on networks
// where IPv6 is broken.
function createClient() {
  // `pgbouncer=true` is a Prisma-engine-only flag, so drop it for node-postgres.
  // Quotes can survive from .env files pasted into hosting dashboards, so trim them too.
  const url = (process.env.DATABASE_URL ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/([?&])pgbouncer=true&?/, '$1')
    .replace(/[?&]$/, '');
  const pool = new Pool({ connectionString: url, max: 5 });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
