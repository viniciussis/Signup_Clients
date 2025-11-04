import {
  NotFoundException,
  ConflictException,
  Injectable,
  Inject,
} from '@nestjs/common';
import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { UpdateClienteDto } from '../dtos/update-cliente.dto';
import { Cliente } from '@/domain/entities/cliente.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @Inject(IClienteRepository)
    private readonly clienteRepository: IClienteRepository,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: cacheManager.Cache,
  ) {}

  async execute(id: string, data: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    if (data.email && data.email !== cliente.email) {
      const emailExists = await this.clienteRepository.findByEmail(data.email);
      if (emailExists && emailExists._id.toString() !== id) {
        throw new ConflictException('O novo e-mail já está em uso.');
      }
    }

    const clienteAtualizado = await this.clienteRepository.update(id, data);

    if (!clienteAtualizado) {
      throw new NotFoundException('Cliente não pôde ser atualizado.');
    }

    try {
      const cacheKey = `cliente:${id}`;

      await this.cacheManager.del(cacheKey);
    } catch (error) {
      console.error('Erro ao invalidar o cache:', error);
    }

    return clienteAtualizado;
  }
}
