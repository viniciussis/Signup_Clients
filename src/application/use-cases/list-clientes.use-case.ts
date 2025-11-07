import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { Cliente } from '@/domain/entities/cliente.entity';

export class ListClientesUseCase {
  constructor(private readonly clienteRepository: IClienteRepository) {}

  async execute(): Promise<Cliente[]> {
    return this.clienteRepository.findAll();
  }
}
