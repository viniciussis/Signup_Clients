import { ChannelWrapper, AmqpConnectionManager } from 'amqp-connection-manager';
import { Cliente } from '@/domain/entities/cliente.entity';
import { Channel, ConsumeMessage } from 'amqplib';
import * as amqp from 'amqp-connection-manager';

export let rabbitMQChannel: ChannelWrapper;
let connection: AmqpConnectionManager;

const QUEUE_NAME = 'cliente_created';

const handleClienteCreated = (data: Cliente) => {
  try {
    if (!data || !data.nome) {
      console.warn('Mensagem malformada recebida:', data);
      return;
    }

    console.log('--- EVENTO RECEBIDO: cliente_created ---');
    console.log(`Cliente: ${data.nome} (ID: ${data._id})`);
    console.log(`E-mail: ${data.email}`);
    console.log('-----------------------------------------');
  } catch (error) {
    console.error('Erro ao processar mensagem de cliente_created:', error);
  }
};

const setupConsumer = async (channel: Channel) => {
  try {
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`... Aguardando mensagens na fila: ${QUEUE_NAME}`);
    await channel.consume(
      QUEUE_NAME,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          const data = msg.content as unknown as Cliente;
          handleClienteCreated(data);

          channel.ack(msg);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error('Erro ao configurar o consumidor RabbitMQ:', error);
  }
};

export function initializeRabbitMQ() {
  const uri = process.env.RABBITMQ_URI;
  if (!uri) {
    console.error('ERRO: RABBITMQ_URI não definida no .env');
    process.exit(1);
  }

  connection = amqp.connect([uri]);
  rabbitMQChannel = connection.createChannel({
    json: true,
    setup: setupConsumer,
  });

  connection.on('connect', () => console.log('✅ Conectado ao RabbitMQ.'));
  connection.on('disconnect', (err) =>
    console.error('⚠️ Conexão perdida com RabbitMQ:', err?.err?.message),
  );
}
