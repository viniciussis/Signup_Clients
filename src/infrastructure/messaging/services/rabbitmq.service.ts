import { IMessagingService } from '@/domain/services/messaging.service.interface';
import { ChannelWrapper } from 'amqp-connection-manager';

export class RabbitMQMessagingService implements IMessagingService {
  constructor(private readonly channel: ChannelWrapper) {}

  async publish(topic: string, message: any): Promise<void> {
    try {
      const queueName = topic;
      await this.channel.assertQueue(queueName, { durable: true });

      await this.channel.sendToQueue(queueName, message);
    } catch (error) {
      console.error('Falha ao publicar mensagem no RabbitMQ', error);
      throw error;
    }
  }
}
