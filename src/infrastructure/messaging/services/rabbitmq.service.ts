import { IMessagingService } from '@/domain/services/messaging.service.interface';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_SERVICE } from '../constants';

@Injectable()
export class RabbitMQMessagingService
  implements IMessagingService, OnModuleInit
{
  constructor(
    @Inject(RABBITMQ_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Falha ao conectar ao RabbitMQ', error);
    }
  }

  publish(topic: string, message: any) {
    return this.client.emit(topic, message);
  }
}
