/* eslint-disable @typescript-eslint/unbound-method */
import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { CreateClienteUseCase } from '@/application/use-cases/create-cliente.use-case';
import { IMessagingService } from '@/domain/services/messaging.service.interface';
import { CreateClienteDto } from '@/application/dtos/create-cliente.dto';
import { AppError } from '@/infrastructure/http/errors/AppError';
import { Cliente } from '@/domain/entities/cliente.entity';

const mockClienteRepository: jest.Mocked<IClienteRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const mockMessagingService: jest.Mocked<IMessagingService> = {
  publish: jest.fn(),
};

describe('CreateClienteUseCase', () => {
  let useCase: CreateClienteUseCase;

  beforeEach(() => {
    jest.resetAllMocks();
    useCase = new CreateClienteUseCase(
      mockClienteRepository,
      mockMessagingService,
    );
  });

  it('deve criar um novo cliente com sucesso e publicar um evento', async () => {
    const dto: CreateClienteDto = {
      nome: 'Clark Kent',
      email: 'clark@kent.com',
      telefone: '555-0200',
    };
    mockClienteRepository.findByEmail.mockResolvedValue(null);
    const clienteMockado = new Cliente(dto);
    mockClienteRepository.create.mockResolvedValue(clienteMockado);
    mockMessagingService.publish.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(result).toEqual(clienteMockado);
    expect(mockMessagingService.publish).toHaveBeenCalledWith(
      'cliente_created',
      clienteMockado,
    );
  });

  it('deve lançar AppError se o e-mail já existir', async () => {
    const dto: CreateClienteDto = {
      nome: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      telefone: '555-0200',
    };
    const clienteExistente = new Cliente(dto);
    mockClienteRepository.findByEmail.mockResolvedValue(clienteExistente);

    await expect(useCase.execute(dto)).rejects.toThrow(AppError);
    await expect(useCase.execute(dto)).rejects.toThrow(
      'Um cliente com este e-mail já existe.',
    );

    expect(mockClienteRepository.create).not.toHaveBeenCalled();
    expect(mockMessagingService.publish).not.toHaveBeenCalled();
  });

  it('deve criar um cliente mesmo se a publicação do evento falhar (Resiliência)', async () => {
    const dto: CreateClienteDto = {
      nome: 'Bruce Wayne',
      email: 'bruce@wayne.com',
      telefone: '999-9999',
    };
    mockClienteRepository.findByEmail.mockResolvedValue(null);
    const clienteMockado = new Cliente(dto);
    mockClienteRepository.create.mockResolvedValue(clienteMockado);
    mockMessagingService.publish.mockRejectedValue(new Error('Falha na fila'));

    const result = await useCase.execute(dto);

    expect(result).toEqual(clienteMockado);
    expect(mockClienteRepository.create).toHaveBeenCalledTimes(1);
    expect(mockMessagingService.publish).toHaveBeenCalledTimes(1);
  });
});
