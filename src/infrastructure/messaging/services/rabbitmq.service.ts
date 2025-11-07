import { IMessagingService } from '@/domain/services/messaging.service.interface';
import { ChannelWrapper } from 'amqp-connection-manager';
import { rabbitMQChannel } from '../rabbitmq/connection';

const QUEUE_NAME = 'clientes_queue';

export class RabbitMQMessagingService implements IMessagingService {
  private readonly channel: ChannelWrapper;

  constructor() {
    this.channel = rabbitMQChannel;
  }

  async publish(topic: string, message: any): Promise<void> {
    try {
      await this.channel.assertQueue(QUEUE_NAME, { durable: true });

      const queueName = topic;
      await this.channel.assertQueue(queueName, { durable: true });

      await this.channel.sendToQueue(queueName, message);
    } catch (error) {
      console.error('Falha ao publicar mensagem no RabbitMQ', error);

      throw error;
    }
  }
}
