import { ICacheService } from '@/domain/services/cache.service.interface';
import { redisClient } from './connection';
import { Redis } from 'ioredis';

export class RedisCacheService implements ICacheService {
  private readonly client: Redis;
  private readonly defaultTTLInSeconds: number = 60;

  constructor() {
    this.client = redisClient;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  }

  async set(key: string, value: unknown, ttlInSeconds?: number): Promise<void> {
    const ttl = ttlInSeconds || this.defaultTTLInSeconds;
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
