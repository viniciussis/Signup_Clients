import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 2. Cria a aplicação HTTP (API)
  const app = await NestFactory.create(AppModule);

  // Pega o ConfigService (já que o AppModule o torna global)
  const configService = app.get(ConfigService);

  // 3. Conecta o "listener" de Microserviço (RabbitMQ)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
      queue: 'clientes_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Inicia TODOS os serviços (HTTP e Microserviço)
  await app.startAllMicroservices();
  await app.listen(configService.get<string>('PORT') || 3000);
}
void bootstrap();
