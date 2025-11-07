import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICliente {
  nome: string;
  email: string;
  telefone: string;
}

export interface ClienteDocument extends Document {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClienteSchema = new Schema<ClienteDocument>(
  {
    nome: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    telefone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'clientes',
  },
);

export const ClienteModel = mongoose.model<ClienteDocument>(
  'Cliente',
  ClienteSchema,
);
