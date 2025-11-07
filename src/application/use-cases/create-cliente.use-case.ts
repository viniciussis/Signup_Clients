import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { IMessagingService } from '@/domain/services/messaging.service.interface';
import { CreateClienteDto } from '@/application/dtos/create-cliente.dto';
import { AppError } from '@/infrastructure/http/errors/AppError';
import { Cliente } from '@/domain/entities/cliente.entity';
import { StatusCodes } from 'http-status-codes';

export class CreateClienteUseCase {
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly messagingService: IMessagingService,
  ) {}

  async execute(data: CreateClienteDto): Promise<Cliente> {
    const emailExists = await this.clienteRepository.findByEmail(data.email);

    if (emailExists) {
      throw new AppError(
        'Um cliente com este e-mail já existe.',
        StatusCodes.CONFLICT,
      );
    }

    const clienteEntity = new Cliente({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
    });

    const novoCliente = await this.clienteRepository.create(clienteEntity);

    try {
      await this.messagingService.publish('cliente_created', novoCliente);
    } catch (error) {
      console.error('Falha ao publicar evento de cliente criado', error);
    }

    return novoCliente;
  }
}
