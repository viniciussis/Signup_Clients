export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlInSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export const ICacheService = Symbol('ICacheService');
