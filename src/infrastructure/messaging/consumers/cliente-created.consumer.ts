import { MessagePattern, Payload } from '@nestjs/microservices';
import { Cliente } from '@/domain/entities/cliente.entity';
import { Controller } from '@nestjs/common';

@Controller()
export class ClienteCreatedConsumer {
  @MessagePattern('cliente_created')
  handleClienteCreated(@Payload() data: Cliente) {
    console.log('--- EVENTO RECEBIDO: cliente_created ---');
    console.log(`Cliente: ${data.nome} (ID: ${data._id})`);
    console.log(`E-mail: ${data.email}`);
    console.log('-----------------------------------------');
  }
}
