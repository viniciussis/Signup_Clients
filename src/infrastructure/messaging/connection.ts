import amqplib, { Channel, Connection } from 'amqplib';

export let rabbitMQChannel: Channel;
let rabbitMQConnection: Connection;

export async function initializeRabbitMQ() {
  const uri = process.env.RABBITMQ_URI;
  if (!uri) {
    console.error('ERRO: RABBITMQ_URI não definida no .env');
    process.exit(1);
  }

  try {
    rabbitMQConnection = await amqplib.connect(uri);
    rabbitMQChannel = await rabbitMQConnection.createChannel();

    console.log('🔌 Conectado ao RabbitMQ.');
  } catch (error) {
    console.error('Falha ao conectar ao RabbitMQ:', error);
    process.exit(1);
  }
}

// TODO: Precisaremos mover a lógica do 'ClienteCreatedConsumer' para cá
// async function setupConsumers() {
//   const queue = 'clientes_queue';
//   await rabbitMQChannel.assertQueue(queue, { durable: true });
//   // ... lógica de consumo
// }
