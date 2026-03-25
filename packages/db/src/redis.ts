import Redis, { type RedisOptions } from "ioredis";

const defaultOptions: RedisOptions = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
  db: Number(process.env.REDIS_DB ?? 0),
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

export function createRedisClient(options?: Partial<RedisOptions>): Redis {
  return new Redis({ ...defaultOptions, ...options });
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
