import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { ClienteDocument, ClienteModel } from '../models/cliente.model';
import { Cliente } from '@/domain/entities/cliente.entity';
import { MongooseBaseRepository } from './base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

type CreateClienteData = Omit<
  Cliente,
  '_id' | 'createdAt' | 'updatedAt' | 'updateInfo'
>;
type UpdateClienteData = Partial<CreateClienteData>;

@Injectable()
export class MongooseClienteRepository
  extends MongooseBaseRepository<Cliente, ClienteDocument, UpdateClienteData>
  implements IClienteRepository
{
  constructor(
    @InjectModel(ClienteModel.name)
    private readonly clienteModel: Model<ClienteDocument>,
  ) {
    super(clienteModel);
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
    const document = await this.clienteModel.findOne({ email }).exec();
    return document ? this.toEntity(document) : null;
  }
}
