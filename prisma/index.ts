import { PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

import config from '../src/config';
import logger from '../src/shared/helpers/logger.helper';

export type CustomPrismaClient = PrismaClient<{ omit: { user: { password: true } } }, never, DefaultArgs>;

export class Database {
  // eslint-disable-next-line no-use-before-define
  private static instance: Database;
  private prisma: CustomPrismaClient;

  private constructor() {
    if (config.application.get('env') === 'production') {
      this.prisma = new PrismaClient({
        omit: {
          user: {
            password: true,
          },
        },
      });
    } else {
      const globalWithPrisma = global as typeof globalThis & {
        prisma: CustomPrismaClient;
      };
      if (!globalWithPrisma.prisma) {
        globalWithPrisma.prisma = new PrismaClient({
          omit: {
            user: {
              password: true,
            },
          },
        });
      }
      this.prisma = globalWithPrisma.prisma;
    }
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully'.green.underline);
    } catch (error) {
      logger.error('Error connecting to database:'.red, error);
    }
  }

  getPrismaClient(): PrismaClient<{ omit: { user: { password: true } } }, never, DefaultArgs> {
    // Add soft delete extension to the prisma client
    const extendedPrisma = this.prisma.$extends(
      createSoftDeleteExtension({
        models: {
          User: true,
        },
        defaultConfig: {
          field: 'deletedAt',
          createValue: (deleted) => {
            if (deleted) return new Date();
            return null;
          },
        },
      })
    ) as CustomPrismaClient;

    return extendedPrisma;
  }
}

// Initialize and connect to the database
const db = Database.getInstance();
db.connect();

export default db.getPrismaClient();
