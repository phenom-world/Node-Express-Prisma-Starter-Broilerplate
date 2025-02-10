import { createClient, RedisClientType } from 'redis';

import logger from '../helpers/logger.helper';

interface CacheConnectionOptions {
  username: string;
  password: string;
  host: string;
  port: string;
  database: number;
  url?: string;
}

let client: RedisClientType;

export const connect = async (data: CacheConnectionOptions): Promise<void> => {
  const { username, password, host, port, database, url } = data;

  client = createClient({
    url: url || `redis://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${encodeURIComponent(host)}:${port}/${database}`,
  });

  client.on('connect', (): void => {
    logger.info('Redis connection successful');
  });

  client.on('error', (err: Error): void => {
    logger.error(`Redis: Something went wrong ${err}`);
  });
  await client.connect();
};

export const get = (key: string): Promise<string | null> => client.get(key);
export const del = (key: string): Promise<number> => client.del(key);
export const set = async (key: string, value: number | string, expiryInMilliseconds?: number): Promise<string | null> => {
  const setValue = await client.set(key, value);
  if (expiryInMilliseconds) {
    await client.expire(key, expiryInMilliseconds / 1000);
  }
  return setValue;
};

export const exists = (key: string): Promise<number> => client.exists(key);
export const expire = (key: string, expiryInMilliseconds: number): Promise<boolean> => client.expire(key, expiryInMilliseconds / 1000);
export const hSet = async (key: string, data: [string, string | number][], expiryInMilliseconds?: number): Promise<number> => {
  const transaction = client.multi().hSet(key, data);
  if (expiryInMilliseconds) {
    transaction.expire(key, expiryInMilliseconds);
  }
  const [result] = await transaction.exec();
  return result as number;
};

export const hGet = (key: string, field: string): Promise<string | undefined> => client.hGet(key, field);
export const hGetAll = (key: string): Promise<{ [key: string]: string }> => client.hGetAll(key);
export const hDel = (key: string, field: string): Promise<number> => client.hDel(key, field);
