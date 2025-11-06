import { Redis } from 'ioredis';

export let redisClient: Redis;

export async function initializeRedis() {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  if (!host || !port) {
    console.error('ERRO: REDIS_HOST ou REDIS_PORT não definidos no .env');
    process.exit(1);
  }

  redisClient = new Redis({
    host: host,
    port: Number(port),
  });

  redisClient.on('connect', () => {
    console.log('🔌 Conectado ao Redis.');
  });

  redisClient.on('error', (err) => {
    console.error('Falha ao conectar ao Redis:', err);
    process.exit(1);
  });

  return new Promise<void>((resolve) => {
    redisClient.on('connect', () => {
      resolve();
    });
  });
}
