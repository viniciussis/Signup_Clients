import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { MongooseClienteRepository } from './mongoose/repositories/cliente.repository';
import { ClienteModel, ClienteSchema } from './mongoose/models/cliente.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    // 1. Registra os Schemas/Models no Mongoose
    MongooseModule.forFeature([
      { name: ClienteModel.name, schema: ClienteSchema },
    ]),
  ],
  // 2. Aqui acontece a Inversão de Dependência!
  providers: [
    {
      provide: IClienteRepository, // O TOKEN (Interface do Domínio)
      useClass: MongooseClienteRepository, // A IMPLEMENTAÇÃO (Infra Concreta)
    },
  ],
  // 3. Exporta o provider para ser usado em outros módulos
  exports: [IClienteRepository],
})
export class DatabaseModule {}
