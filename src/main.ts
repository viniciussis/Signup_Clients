import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './infrastructure/http/errors/AppError';
import { router } from './infrastructure/http/routes';

import { connectDB } from './infrastructure/database/mongoose/connection';
import {
  initializeRedis,
  redisClient,
} from './infrastructure/cache/redis/connection';
import {
  initializeRabbitMQ,
  rabbitMQChannel,
} from './infrastructure/messaging/rabbitmq/connection';
import { createClienteRoutes } from './infrastructure/http/routes/cliente.routes';

import { MongooseClienteRepository } from './infrastructure/database/mongoose/repositories/cliente.repository';
import { RedisCacheService } from './infrastructure/cache/redis/redis-cache.service';
import { RabbitMQMessagingService } from './infrastructure/messaging/services/rabbitmq.service';
import { CreateClienteUseCase } from './application/use-cases/create-cliente.use-case';
import { GetClienteByIdUseCase } from './application/use-cases/get-cliente-by-id.use-case';
import { ListClientesUseCase } from './application/use-cases/list-clientes.use-case';
import { UpdateClienteUseCase } from './application/use-cases/update-cliente.use-case';
import { DeleteClienteUseCase } from './application/use-cases/delete-cliente.use-case';
import { ClienteController } from './infrastructure/http/controllers/cliente.controller';

const main = async () => {
  await connectDB();
  await initializeRedis();
  initializeRabbitMQ();
  const clienteRepository = new MongooseClienteRepository();
  const cacheService = new RedisCacheService(redisClient);
  const messagingService = new RabbitMQMessagingService(rabbitMQChannel);

  const createClienteUseCase = new CreateClienteUseCase(
    clienteRepository,
    messagingService,
  );
  const getClienteByIdUseCase = new GetClienteByIdUseCase(
    clienteRepository,
    cacheService,
  );
  const listClientesUseCase = new ListClientesUseCase(clienteRepository);
  const updateClienteUseCase = new UpdateClienteUseCase(
    clienteRepository,
    cacheService,
  );
  const deleteClienteUseCase = new DeleteClienteUseCase(
    clienteRepository,
    cacheService,
  );

  const clienteController = new ClienteController(
    getClienteByIdUseCase,
    createClienteUseCase,
    updateClienteUseCase,
    deleteClienteUseCase,
    listClientesUseCase,
  );

  const clienteRoutes = createClienteRoutes(clienteController);

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(router);
  app.use('/clientes', clienteRoutes);

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
