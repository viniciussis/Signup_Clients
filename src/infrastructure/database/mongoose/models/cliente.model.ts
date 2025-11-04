import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'clientes',
})
export class ClienteModel {
  @Prop({ required: true, type: String })
  nome: string;

  @Prop({ required: true, unique: true, type: String, index: true })
  email: string;

  @Prop({ required: true, type: String })
  telefone: string;
}

export type ClienteDocument = Document & {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ClienteSchema = SchemaFactory.createForClass(ClienteModel);
