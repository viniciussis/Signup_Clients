import { initializeRabbitMQ } from './infrastructure/messaging/rabbitmq/connection';
import { connectDB } from './infrastructure/database/mongoose/connection';
import { initializeRedis } from './infrastructure/cache/redis/connection';
import express, { Request, Response, NextFunction } from 'express';
import { AppError } from './infrastructure/http/errors/AppError';
import { router } from './infrastructure/http/routes';
import { StatusCodes } from 'http-status-codes';
import 'express-async-errors';
import 'dotenv/config';

const main = async () => {
  await connectDB();
  await initializeRedis();
  await initializeRabbitMQ();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(router);

  app.use(
    (err: Error, request: Request, response: Response, _: NextFunction) => {
      if (err instanceof AppError) {
        return response.status(err.statusCode).json({
          status: 'error',
          message: err.message,
        });
      }

      console.error(err);
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    },
  );

  app.listen(PORT, () =>
    console.log(`🚀 Servidor Express rodando na porta ${PORT}`),
  );
};

void main();
