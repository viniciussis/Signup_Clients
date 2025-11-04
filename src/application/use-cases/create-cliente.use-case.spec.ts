import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { IMessagingService } from '@/domain/services/messaging.service.interface';
import { CreateClienteUseCase } from '@/application/use-cases/create-cliente.use-case';
import { CreateClienteDto } from '@/application/dtos/create-cliente.dto';
import { Cliente } from '@/domain/entities/cliente.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

const mockClienteRepository = {
  findByEmail: jest.fn<Promise<Cliente | null>, [string]>(),
  create: jest.fn<Promise<Cliente>, [Cliente]>(),
};

const mockMessagingService = {
  publish: jest.fn<Promise<void>, [string, any]>(),
};

describe('CreateClienteUseCase', () => {
  let useCase: CreateClienteUseCase;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClienteUseCase,
        {
          provide: IClienteRepository,
          useValue: mockClienteRepository,
        },
        {
          provide: IMessagingService,
          useValue: mockMessagingService,
        },
      ],
    }).compile();

    useCase = module.get<CreateClienteUseCase>(CreateClienteUseCase);
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
    expect(mockClienteRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockClienteRepository.create).toHaveBeenCalledWith(
      expect.any(Cliente),
    );
    expect(mockClienteRepository.create.mock.calls[0][0].email).toBe(dto.email);
    expect(mockMessagingService.publish).toHaveBeenCalledWith(
      'cliente_created',
      clienteMockado,
    );
  });

  it('deve lançar ConflictException se o e-mail já existir', async () => {
    const dto: CreateClienteDto = {
      nome: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      telefone: '555-0200',
    };

    const clienteExistente = new Cliente(dto);
    mockClienteRepository.findByEmail.mockResolvedValue(clienteExistente);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    await expect(useCase.execute(dto)).rejects.toThrow(
      'Um cliente com este e-mail já existe.',
    );
    expect(mockClienteRepository.create).not.toHaveBeenCalled();
    expect(mockMessagingService.publish).not.toHaveBeenCalled();
  });
});
