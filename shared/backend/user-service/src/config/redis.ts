import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.disconnect();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

// Utility functions for common Redis operations
export async function setKey(key: string, value: string, expireSeconds?: number): Promise<void> {
  try {
    if (expireSeconds) {
      await redisClient.setEx(key, expireSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    logger.error('Error setting Redis key:', error);
    throw error;
  }
}

export async function getKey(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Error getting Redis key:', error);
    throw error;
  }
}

export async function deleteKey(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Error deleting Redis key:', error);
    throw error;
  }
}

export async function setHash(key: string, field: string, value: string): Promise<void> {
  try {
    await redisClient.hSet(key, field, value);
  } catch (error) {
    logger.error('Error setting Redis hash:', error);
    throw error;
  }
}

export async function getHash(key: string, field: string): Promise<string | null> {
  try {
    return await redisClient.hGet(key, field);
  } catch (error) {
    logger.error('Error getting Redis hash:', error);
    throw error;
  }
}

export async function getAllHash(key: string): Promise<Record<string, string> | null> {
  try {
    return await redisClient.hGetAll(key);
  } catch (error) {
    logger.error('Error getting all Redis hash fields:', error);
    throw error;
  }
}

