import { Prisma } from '@prisma/client';

import { CustomPrismaClient } from '../../prisma';

export type IPrismaModelMethods =
  | 'findUnique'
  | 'findUniqueOrThrow'
  | 'findFirst'
  | 'findFirstOrThrow'
  | 'findMany'
  | 'create'
  | 'createMany'
  | 'createManyAndReturn'
  | 'delete'
  | 'update'
  | 'deleteMany'
  | 'updateMany'
  | 'upsert'
  | 'aggregate'
  | 'groupBy'
  | 'count';

export type PrismaModelMethodArgs<
  T extends Capitalize<Prisma.ModelName>,
  M extends IPrismaModelMethods,
> = Prisma.TypeMap['model'][T]['operations'][M]['args'];

export type IPrismaModelMethodResults<
  T extends Capitalize<Prisma.ModelName>,
  M extends IPrismaModelMethods,
> = Prisma.TypeMap['model'][T]['operations'][M]['result'];

// export type WherePayload<T extends Capitalize<Prisma.ModelName>> = Prisma.TypeMap['model'][T]['operations']['findFirst']['args']['where'];
export type FindOneOptions<T extends Capitalize<Prisma.ModelName>> = {
  [K in keyof PrismaModelMethodArgs<T, 'findFirst'>]: K extends 'where' ? never : PrismaModelMethodArgs<T, 'findFirst'>[K];
} & {
  errorIfFound?: boolean;
  errorMessage?: string;
};

export type PrismaDelegate<Client extends CustomPrismaClient, Model extends Uncapitalize<Prisma.ModelName>> = Client[Model] extends {
  count: (...args: unknown[]) => Promise<number>;
  findMany: (...args: unknown[]) => Promise<unknown[]>;
  findFirst: (...args: unknown[]) => Promise<unknown>;
  findFirstOrThrow: (...args: unknown[]) => Promise<unknown>;
  delete: (...args: unknown[]) => Promise<unknown>;
  create: (...args: unknown[]) => Promise<unknown>;
  createMany: (...args: unknown[]) => Promise<unknown>;
  update: (...args: unknown[]) => Promise<unknown>;
  groupBy: (...args: unknown[]) => Promise<unknown>;
  aggregate: (...args: unknown[]) => Promise<unknown>;
  findUniqueOrThrow: (...args: unknown[]) => Promise<unknown>;
  deleteMany: (...args: unknown[]) => Promise<unknown>;
  updateMany: (...args: unknown[]) => Promise<unknown>;
  upsert: (...args: unknown[]) => Promise<unknown>;
  findUnique: (...args: unknown[]) => Promise<unknown>;
}
  ? Client[Model]
  : never;

export type RepoType<Model extends Capitalize<Prisma.ModelName>> = PrismaDelegate<CustomPrismaClient, Uncapitalize<Model>>;

export type FindManyResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'findMany'>>;
export type CreateResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'create'>>;
export type UpdateResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'update'>>;
export type AggregateResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'aggregate'>>;
export type CreateManyResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'createMany'>>;
export type CountResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'count'>>;
export type FindFirstResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'findFirstOrThrow'>>;
export type UpsertResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'upsert'>>;
export type GroupByResult<Model extends Capitalize<Prisma.ModelName>> = Required<IPrismaModelMethodResults<Model, 'groupBy'>>;
