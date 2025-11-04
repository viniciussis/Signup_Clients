import { randomUUID } from 'crypto';

export abstract class BaseEntity {
  readonly _id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props?: { _id?: string; createdAt?: Date; updatedAt?: Date }) {
    this._id = props?._id ?? randomUUID();
    this.createdAt = props?.createdAt ?? new Date();
    this.updatedAt = props?.updatedAt ?? new Date();
  }
}
