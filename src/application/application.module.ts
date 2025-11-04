import { GetClienteByIdUseCase } from './use-cases/get-cliente-by-id.use-case';
import { MessagingModule } from '@/infrastructure/messaging/messaging.module';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { CreateClienteUseCase } from './use-cases/create-cliente.use-case';
import { UpdateClienteUseCase } from './use-cases/update-cliente.use-case';
import { DeleteClienteUseCase } from './use-cases/delete-cliente.use-case';
import { ListClientesUseCase } from './use-cases/list-clientes.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, MessagingModule],
  providers: [
    CreateClienteUseCase,
    GetClienteByIdUseCase,
    ListClientesUseCase,
    UpdateClienteUseCase,
    DeleteClienteUseCase,
  ],
  exports: [
    CreateClienteUseCase,
    GetClienteByIdUseCase,
    ListClientesUseCase,
    UpdateClienteUseCase,
    DeleteClienteUseCase,
  ],
})
export class ApplicationModule {}
