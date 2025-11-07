import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { ICacheService } from '@/domain/services/cache.service.interface';
import { UpdateClienteDto } from '@/application/dtos/update-cliente.dto';
import { AppError } from '@/infrastructure/http/errors/AppError';
import { Cliente } from '@/domain/entities/cliente.entity';
import { StatusCodes } from 'http-status-codes';

export class UpdateClienteUseCase {
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(id: string, data: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new AppError('Cliente não encontrado.', StatusCodes.NOT_FOUND);
    }

    if (data.email && data.email !== cliente.email) {
      const emailExists = await this.clienteRepository.findByEmail(data.email);
      if (emailExists && emailExists._id.toString() !== id) {
        throw new AppError(
          'O novo e-mail já está em uso.',
          StatusCodes.CONFLICT,
        );
      }
    }

    const clienteAtualizado = await this.clienteRepository.update(id, data);

    if (!clienteAtualizado) {
      throw new AppError(
        'Cliente não pôde ser atualizado.',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const cacheKey = `cliente:${id}`;
      await this.cacheService.del(cacheKey);
    } catch (error) {
      console.error('Erro ao invalidar o cache:', error);
    }

    return clienteAtualizado;
  }
}
