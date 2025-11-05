import { PrismaClient } from '@prisma/client';

declare global {
  // [joaovictor - 05/11/2025] Evita recriação no hot reload
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
