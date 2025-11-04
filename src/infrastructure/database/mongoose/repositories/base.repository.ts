import { IBaseRepository } from '@/domain/repositories/base.repository.interface';
import { BaseEntity } from '@/domain/entities/base.entity';
import { Document, Model } from 'mongoose';

/**
 * T = Entidade de Domínio (ex: Cliente)
 * D = Documento do Mongoose (ex: ClienteDocument)
 * K = DTO de Criação
 * U = DTO de Atualização
 */
export abstract class MongooseBaseRepository<
  T extends BaseEntity,
  D extends Document,
  U,
> implements IBaseRepository<T, U>
{
  constructor(private readonly model: Model<D>) {}

  protected abstract toEntity(document: D): T;

  async create(entity: T): Promise<T> {
    const { _id: _, ...dataForModel } = entity;
    const newDocument = new this.model(dataForModel);
    const saved = (await newDocument.save()) as D;
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<T | null> {
    const document = (await this.model.findById(id).exec()) as D;
    return document ? this.toEntity(document) : null;
  }

  async findAll(): Promise<T[]> {
    const documents = (await this.model.find().exec()) as D[];
    return documents.map((doc) => this.toEntity(doc));
  }

  async update(id: string, data: U): Promise<T | null> {
    const document = (await this.model
      .findByIdAndUpdate(id, data as Partial<D>, { new: true })
      .exec()) as D;

    return document ? this.toEntity(document) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();

    return result != null;
  }
}
