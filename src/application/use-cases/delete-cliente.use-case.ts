import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { ICacheService } from '@/domain/services/cache.service.interface';
import { AppError } from '@/infrastructure/http/errors/AppError';
import { StatusCodes } from 'http-status-codes';

export class DeleteClienteUseCase {
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(id: string): Promise<void> {
    const wasDeleted = await this.clienteRepository.delete(id);

    if (!wasDeleted) {
      throw new AppError('Cliente não encontrado.', StatusCodes.NOT_FOUND);
    }

    try {
      const cacheKey = `cliente:${id}`;
      await this.cacheService.del(cacheKey);
    } catch (error) {
      console.error(
        `Falha ao invalidar cache para cliente deletado: ${id}`,
        error,
      );
    }
  }
}
