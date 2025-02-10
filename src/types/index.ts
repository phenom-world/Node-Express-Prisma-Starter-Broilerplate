import { Request } from 'express';
import { z } from 'zod';

export type ObjectData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type InferSchema<T> = T extends z.ZodType<infer U> ? U : never;
export type CustomRequest<T> = Request<Record<string, string>, Record<string, unknown>, T>;
export type Paginate = { limit: number; offset: number };
export type PaginateResponse<T> = {
  count: number;
  records: T;
};

export type Intent = 'authorize' | 'capture';
