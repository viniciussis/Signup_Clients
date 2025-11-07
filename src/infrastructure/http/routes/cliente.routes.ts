import { Router } from 'express';

import { CreateClienteDto } from '@/application/dtos/create-cliente.dto';
import { UpdateClienteDto } from '@/application/dtos/update-cliente.dto';
import { validateDto } from '../middlewares/validate-dto.middleware';

import { ClienteController } from '../controllers/cliente.controller';

import { GetClienteByIdUseCase } from '@/application/use-cases/get-cliente-by-id.use-case';
import { CreateClienteUseCase } from '@/application/use-cases/create-cliente.use-case';
import { DeleteClienteUseCase } from '@/application/use-cases/delete-cliente.use-case';
import { UpdateClienteUseCase } from '@/application/use-cases/update-cliente.use-case';
import { ListClientesUseCase } from '@/application/use-cases/list-clientes.use-case';

import { MongooseClienteRepository } from '@/infrastructure/database/mongoose/repositories/cliente.repository';
import { RabbitMQMessagingService } from '@/infrastructure/messaging/services/rabbitmq.service';
import { RedisCacheService } from '@/infrastructure/cache/redis/redis-cache.service';

const clienteRepository = new MongooseClienteRepository();
const cacheService = new RedisCacheService();
const messagingService = new RabbitMQMessagingService();

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

const clienteRoutes = Router();

clienteRoutes.post(
  '/',
  validateDto(CreateClienteDto),
  clienteController.create,
);

clienteRoutes.get('/', clienteController.findAll);
clienteRoutes.get('/:id', clienteController.findOne);

clienteRoutes.patch(
  '/:id',
  validateDto(UpdateClienteDto),
  clienteController.update,
);

clienteRoutes.delete('/:id', clienteController.delete);

export { clienteRoutes };
