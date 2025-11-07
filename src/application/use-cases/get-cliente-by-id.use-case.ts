import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { ICacheService } from '@/domain/services/cache.service.interface';
import { AppError } from '@/infrastructure/http/errors/AppError';
import { Cliente } from '@/domain/entities/cliente.entity';
import { StatusCodes } from 'http-status-codes';

export class GetClienteByIdUseCase {
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(id: string): Promise<Cliente> {
    const cacheKey = `cliente:${id}`;

    try {
      const cachedCliente = await this.cacheService.get<Cliente>(cacheKey);

      if (cachedCliente) {
        return new Cliente(cachedCliente, {
          _id: cachedCliente._id,
          createdAt: new Date(cachedCliente.createdAt),
          updatedAt: new Date(cachedCliente.updatedAt),
        });
      }
    } catch (error) {
      console.error('Erro ao consultar o cache:', error);
    }

    const cliente = await this.clienteRepository.findById(id);

    if (!cliente) {
      throw new AppError('Cliente não encontrado.', StatusCodes.NOT_FOUND);
    }

    try {
      await this.cacheService.set(cacheKey, cliente);
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }

    return cliente;
  }
}
