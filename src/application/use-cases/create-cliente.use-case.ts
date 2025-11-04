import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { IMessagingService } from '@/domain/services/messaging.service.interface';
import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CreateClienteDto } from '../dtos/create-cliente.dto';
import { Cliente } from '@/domain/entities/cliente.entity';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @Inject(IClienteRepository)
    private readonly clienteRepository: IClienteRepository,

    @Inject(IMessagingService)
    private readonly messagingService: IMessagingService,
  ) {}

  async execute(data: CreateClienteDto): Promise<Cliente> {
    const emailExists = await this.clienteRepository.findByEmail(data.email);

    if (emailExists) {
      throw new ConflictException('Um cliente com este e-mail já existe.');
    }

    const clienteEntity = new Cliente({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
    });

    const novoCliente = await this.clienteRepository.create(clienteEntity);

    try {
      this.messagingService.publish('cliente_created', novoCliente);
    } catch (error) {
      console.error('Falha ao publicar evento de cliente criado', error);
    }

    return novoCliente;
  }
}
