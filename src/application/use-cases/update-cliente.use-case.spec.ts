import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateClienteUseCase } from './update-cliente.use-case';
import { UpdateClienteDto } from '../dtos/update-cliente.dto';
import { Cliente } from '@/domain/entities/cliente.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockClienteRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
};

const mockCacheManager = {
  del: jest.fn(),
};

const clienteId = 'cliente-id-123';
const clienteExistente = new Cliente(
  {
    nome: 'Peter Parker',
    email: 'peter@dailybugle.com',
    telefone: '555-0400',
  },
  { _id: clienteId, createdAt: new Date(), updatedAt: new Date() },
);

describe('UpdateClienteUseCase', () => {
  let useCase: UpdateClienteUseCase;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClienteUseCase,
        { provide: IClienteRepository, useValue: mockClienteRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    useCase = module.get<UpdateClienteUseCase>(UpdateClienteUseCase);
  });

  it('deve atualizar o nome de um cliente e invalidar o cache', async () => {
    const dto: UpdateClienteDto = { nome: 'Peter B. Parker' };

    mockClienteRepository.findById.mockResolvedValue(clienteExistente);

    const clienteAtualizado = { ...clienteExistente, nome: dto.nome };
    mockClienteRepository.update.mockResolvedValue(clienteAtualizado);

    mockCacheManager.del.mockResolvedValue(undefined);

    const result = await useCase.execute(clienteId, dto);

    expect(result.nome).toBe('Peter B. Parker');

    expect(mockClienteRepository.findById).toHaveBeenCalledWith(clienteId);
    expect(mockClienteRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockClienteRepository.update).toHaveBeenCalledWith(clienteId, dto);
    expect(mockCacheManager.del).toHaveBeenCalledWith(`cliente:${clienteId}`);
  });

  it('deve lançar NotFoundException se o cliente não for encontrado', async () => {
    const dto: UpdateClienteDto = { nome: 'Peter B. Parker' };

    mockClienteRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      'Cliente não encontrado.',
    );

    expect(mockClienteRepository.update).not.toHaveBeenCalled();
    expect(mockCacheManager.del).not.toHaveBeenCalled();
  });

  it('deve lançar ConflictException se o novo e-mail já estiver em uso por OUTRO cliente', async () => {
    const dto: UpdateClienteDto = { email: 'outro@cliente.com' };

    mockClienteRepository.findById.mockResolvedValue(clienteExistente);

    const outroCliente = new Cliente(
      {
        nome: 'Outro',
        email: dto.email!,
        telefone: '111',
      },
      { _id: 'id-diferente-456' },
    );
    mockClienteRepository.findByEmail.mockResolvedValue(outroCliente);

    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      ConflictException,
    );
    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      'O novo e-mail já está em uso.',
    );

    expect(mockClienteRepository.update).not.toHaveBeenCalled();
  });

  it('deve atualizar o cliente se o e-mail for o mesmo do cliente atual', async () => {
    const dto: UpdateClienteDto = { email: 'peter@dailybugle.com' };

    mockClienteRepository.findById.mockResolvedValue(clienteExistente);

    mockClienteRepository.update.mockResolvedValue(clienteExistente);

    const result = await useCase.execute(clienteId, dto);

    expect(result).toBe(clienteExistente);
    expect(mockClienteRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockClienteRepository.update).toHaveBeenCalled();
    expect(mockCacheManager.del).toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o update falhar (retornar null)', async () => {
    const dto: UpdateClienteDto = { nome: 'Peter B. Parker' };

    mockClienteRepository.findById.mockResolvedValue(clienteExistente);

    mockClienteRepository.update.mockResolvedValue(null);

    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      'Cliente não pôde ser atualizado.',
    );

    expect(mockCacheManager.del).not.toHaveBeenCalled();
  });

  it('deve atualizar o cliente mesmo se a invalidação do cache falhar', async () => {
    const dto: UpdateClienteDto = { nome: 'Peter B. Parker' };

    mockClienteRepository.findById.mockResolvedValue(clienteExistente);

    const clienteAtualizado = { ...clienteExistente, nome: dto.nome };
    mockClienteRepository.update.mockResolvedValue(clienteAtualizado);

    const cacheError = new Error('Erro no Redis');
    mockCacheManager.del.mockRejectedValue(cacheError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await useCase.execute(clienteId, dto);

    expect(result).toBe(clienteAtualizado);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao invalidar o cache:',
      cacheError,
    );
    consoleErrorSpy.mockRestore();
  });

  it('deve atualizar o e-mail se o novo e-mail estiver livre', async () => {
    const dto: UpdateClienteDto = { email: 'novo-email@livre.com' };

    mockClienteRepository.findById.mockResolvedValue(clienteExistente);

    mockClienteRepository.findByEmail.mockResolvedValue(null);

    const clienteAtualizado = { ...clienteExistente, email: dto.email };
    mockClienteRepository.update.mockResolvedValue(clienteAtualizado);

    mockCacheManager.del.mockResolvedValue(undefined);

    const result = await useCase.execute(clienteId, dto);

    expect(result.email).toBe('novo-email@livre.com');

    expect(mockClienteRepository.findById).toHaveBeenCalledWith(clienteId);
    expect(mockClienteRepository.findByEmail).toHaveBeenCalledWith(dto.email);

    expect(mockClienteRepository.update).toHaveBeenCalledWith(clienteId, dto);
    expect(mockCacheManager.del).toHaveBeenCalledWith(`cliente:${clienteId}`);
  });
});
