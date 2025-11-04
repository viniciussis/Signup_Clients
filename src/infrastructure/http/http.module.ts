import { ApplicationModule } from '@/application/application.module';
import { ClienteController } from './controllers/cliente.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [ApplicationModule],
  controllers: [ClienteController],
})
export class HttpModule {}
