import { PrismaClient } from '../app/generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

// Debug: log the database URL being used
console.log('Database URL:', process.env.DATABASE_URL);

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
});

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = prismaClient;
} else {
  if (!global.prisma) {
    global.prisma = prismaClient;
  }
  prisma = global.prisma;
}

export { prisma }; 