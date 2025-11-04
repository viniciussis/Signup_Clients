import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Cliente } from '@/domain/entities/cliente.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(
    @Inject(IClienteRepository)
    private readonly clienteRepository: IClienteRepository,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: cacheManager.Cache,
  ) {}

  async execute(id: string): Promise<Cliente> {
    const cacheKey = `cliente:${id}`;

    try {
      const cachedCliente = await this.cacheManager.get<Cliente>(cacheKey);

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
      throw new NotFoundException('Cliente não encontrado.');
    }

    try {
      await this.cacheManager.set(cacheKey, cliente);
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }

    return cliente;
  }
}
