import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { ClienteDocument, ClienteModel } from '../models/cliente.model';
import { Cliente } from '@/domain/entities/cliente.entity';
import { MongooseBaseRepository } from './base.repository';

type UpdateClienteData = Partial<
  Omit<Cliente, '_id' | 'createdAt' | 'updatedAt' | 'updateInfo'>
>;

export class MongooseClienteRepository
  extends MongooseBaseRepository<Cliente, ClienteDocument, UpdateClienteData>
  implements IClienteRepository
{
  constructor() {
    super(ClienteModel);
  }

  protected toEntity(document: ClienteDocument): Cliente {
    return new Cliente(
      {
        nome: document.nome,
        email: document.email,
        telefone: document.telefone,
      },
      {
        _id: document._id.toString(),
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
    );
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    const document = await this.model.findOne({ email }).exec();
    return document ? this.toEntity(document) : null;
  }
}
