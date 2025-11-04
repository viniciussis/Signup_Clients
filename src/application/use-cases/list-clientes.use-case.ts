import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { Cliente } from '@/domain/entities/cliente.entity';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ListClientesUseCase {
  constructor(
    @Inject(IClienteRepository)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(): Promise<Cliente[]> {
    return this.clienteRepository.findAll();
  }
}
