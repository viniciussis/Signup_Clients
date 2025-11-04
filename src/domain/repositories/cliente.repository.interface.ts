import { IBaseRepository } from './base.repository.interface';
import { Cliente } from '../entities/cliente.entity';

type CreateClienteData = Omit<
  Cliente,
  '_id' | 'createdAt' | 'updatedAt' | 'updateInfo'
>;
type UpdateClienteData = Partial<CreateClienteData>;

export interface IClienteRepository
  extends IBaseRepository<Cliente, UpdateClienteData> {
  findByEmail(email: string): Promise<Cliente | null>;
}

export const IClienteRepository = Symbol('IClienteRepository');
