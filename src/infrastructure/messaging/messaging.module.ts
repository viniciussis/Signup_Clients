import { IMessagingService } from '@/domain/services/messaging.service.interface';
import { ClienteCreatedConsumer } from './consumers/cliente-created.consumer';
import { RabbitMQMessagingService } from './services/rabbitmq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RABBITMQ_SERVICE } from './constants';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: 'clientes_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ClienteCreatedConsumer],
  providers: [
    {
      provide: IMessagingService,
      useClass: RabbitMQMessagingService,
    },
  ],
  exports: [IMessagingService],
})
export class MessagingModule {}
