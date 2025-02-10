import { Prisma } from '@prisma/client';

import { CustomPrismaClient } from '../../../prisma';
import { ObjectData } from '../../types';
import {
  AggregateResult,
  CountResult,
  CreateManyResult,
  CreateResult,
  FindFirstResult,
  FindManyResult,
  FindOneOptions,
  GroupByResult,
  PrismaModelMethodArgs,
  RepoType,
  UpdateResult,
  UpsertResult,
} from '../../types/repo';
import { BadRequestError, NotFoundError } from './error.util';
import { capitalizeFirst } from './string.util';

export class Repository<ModelName extends Capitalize<Prisma.ModelName>> {
  private readonly repo: RepoType<ModelName>;

  constructor(
    public prisma: CustomPrismaClient,
    protected model: Uncapitalize<ModelName>
  ) {
    this.repo = prisma[this.model] as RepoType<ModelName>;
  }

  async findById<T>(id: string, options?: FindOneOptions<ModelName>) {
    const result = await this.repo.findUnique({ where: { id }, ...options });
    return result as T extends ObjectData ? T : FindFirstResult<ModelName>;
  }

  async findAndCountAll<T>(payload: PrismaModelMethodArgs<ModelName, 'findMany'>) {
    const { skip, take, where } = payload;
    const [count, rows] = await this.prisma.$transaction(async (tx) => {
      const count = await (tx[this.model] as RepoType<ModelName>).count({ where, skip, take });
      const rows = await (tx[this.model] as RepoType<ModelName>).findMany(payload);
      return [count, rows] as const;
    });

    return { count, records: rows as T extends ObjectData ? T : FindManyResult<ModelName> };
  }

  async findMany<T>(payload?: PrismaModelMethodArgs<ModelName, 'findMany'>) {
    return this.repo.findMany(payload) as unknown as T extends ObjectData ? T : FindManyResult<ModelName>;
  }

  async create<T>(payload: PrismaModelMethodArgs<ModelName, 'create'>) {
    return this.repo.create(payload) as unknown as T extends ObjectData ? T : CreateResult<ModelName>;
  }

  async createMany(payload: PrismaModelMethodArgs<ModelName, 'createMany'>) {
    return this.repo.createMany(payload) as unknown as CreateManyResult<ModelName>;
  }

  async update<T>(payload: PrismaModelMethodArgs<ModelName, 'update'>) {
    if (payload.where.id) {
      await this.findOneOrThrow({ where: { id: payload.where.id } });
    }
    return this.repo.update(payload) as unknown as T extends ObjectData ? T : UpdateResult<ModelName>;
  }

  async findOne<T>(payload: PrismaModelMethodArgs<ModelName, 'findFirst'>) {
    const result = await this.repo.findFirst(payload);
    return result as T extends ObjectData ? T : FindFirstResult<ModelName>;
  }

  async findOneOrThrow<T>(payload: PrismaModelMethodArgs<ModelName, 'findFirst'>, errorMessage?: string) {
    const result = await this.repo.findFirst(payload);
    const schema = capitalizeFirst(String(this.model));

    if (!result) {
      throw new NotFoundError(errorMessage ?? `${schema} not found!`);
    }
    return result as T extends ObjectData ? T : FindFirstResult<ModelName>;
  }

  async findOneAndThrow<T>(payload: PrismaModelMethodArgs<ModelName, 'findFirst'>, errorMessage?: string) {
    const result = await this.repo.findFirst(payload);
    const schema = capitalizeFirst(String(this.model));

    if (result) {
      throw new BadRequestError(errorMessage ?? `${schema} already exists`);
    }
    return result as T extends ObjectData ? T : FindFirstResult<ModelName>;
  }

  async count<T>(payload?: PrismaModelMethodArgs<ModelName, 'count'>) {
    return this.repo.count(payload) as unknown as T extends Number ? T : CountResult<ModelName>;
  }

  async upsert(payload: PrismaModelMethodArgs<ModelName, 'upsert'>) {
    return this.repo.upsert(payload) as unknown as UpsertResult<ModelName>;
  }

  async groupBy(payload: PrismaModelMethodArgs<ModelName, 'groupBy'>) {
    return this.repo.groupBy(payload) as unknown as GroupByResult<ModelName>;
  }

  async aggregate(payload: PrismaModelMethodArgs<ModelName, 'aggregate'>) {
    return this.repo.aggregate(payload) as unknown as AggregateResult<ModelName>;
  }

  async delete(payload: PrismaModelMethodArgs<ModelName, 'delete'>) {
    await this.repo.delete(payload);
  }

  async deleteMany(payload: PrismaModelMethodArgs<ModelName, 'deleteMany'>) {
    await this.repo.deleteMany(payload);
  }
}
