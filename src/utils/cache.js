import redis from '../config/redis.js';

const DEFAULT_TTL = 300; // 5 minutes

export const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

export const deleteCache = async (key) => {
  await redis.del(key);
};

export const deleteCacheByPattern = async (pattern) => {
  let cursor = '0';
  const keys = [];

  do {
    const [nextCursor, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== '0');

  if (keys.length > 0) {
    await redis.del(...keys);
  }
};