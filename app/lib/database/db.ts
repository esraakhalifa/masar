import { PrismaClient } from '@prisma/client';
import { logError, logInfo } from '@/app/lib/services/logger';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Add event listeners for logging
prisma.$on('query', (e) => {
  logInfo('Prisma Query', {
    query: e.query,
    params: e.params,
    duration: e.duration,
  });
});

prisma.$on('error', (e) => {
  logError(new Error('Prisma Error'), {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('info', (e) => {
  logInfo('Prisma Info', {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('warn', (e) => {
  logError(new Error('Prisma Warning'), {
    message: e.message,
    target: e.target,
  });
});

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    logInfo('Database connection successful');
    return true;
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Database connection failed'), {
      url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') // Hide password in logs
    });
    return false;
  }
};

// Test connection on startup
testConnection().catch(() => {
  logError(new Error('Failed to test database connection'));
});

export default prisma; 