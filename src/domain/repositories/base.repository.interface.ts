import { BaseEntity } from '../entities/base.entity';

export interface IBaseRepository<T extends BaseEntity, U> {
  create(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, data: U): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
