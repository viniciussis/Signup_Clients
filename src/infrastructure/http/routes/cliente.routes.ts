import { CreateClienteDto } from '@/application/dtos/create-cliente.dto';
import { UpdateClienteDto } from '@/application/dtos/update-cliente.dto';
import { ClienteController } from '../controllers/cliente.controller';
import { validateDto } from '../middlewares/validate-dto.middleware';
import { Router } from 'express';

export const createClienteRoutes = (
  clienteController: ClienteController,
): Router => {
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

  return clienteRoutes;
};
