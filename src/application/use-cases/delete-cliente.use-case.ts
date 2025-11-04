import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import * as cacheManager from 'cache-manager';

@Injectable()
export class DeleteClienteUseCase {
  constructor(
    @Inject(IClienteRepository)
    private readonly clienteRepository: IClienteRepository,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: cacheManager.Cache,
  ) {}

  async execute(id: string): Promise<void> {
    const wasDeleted = await this.clienteRepository.delete(id);

    if (!wasDeleted) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    try {
      const cacheKey = `cliente:${id}`;
      await this.cacheManager.del(cacheKey);
    } catch (error) {
      console.error(
        `Falha ao invalidar cache para cliente deletado: ${id}`,
        error,
      );
    }
  }
}
