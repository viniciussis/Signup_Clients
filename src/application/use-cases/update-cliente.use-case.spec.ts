/* eslint-disable @typescript-eslint/unbound-method */
import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { UpdateClienteUseCase } from '@/application/use-cases/update-cliente.use-case';
import { ICacheService } from '@/domain/services/cache.service.interface';
import { UpdateClienteDto } from '@/application/dtos/update-cliente.dto';
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
const mockCacheService: jest.Mocked<ICacheService> = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const clienteId = 'cliente-id-123';
const clienteExistente = new Cliente({
  nome: 'Peter Parker',
  email: 'peter@dailybugle.com',
  telefone: '555-0001',
});
const outroCliente = new Cliente({
  nome: 'Miles Morales',
  email: 'outro@cliente.com',
  telefone: '555-0002',
});

describe('UpdateClienteUseCase', () => {
  let useCase: UpdateClienteUseCase;

  beforeEach(() => {
    jest.resetAllMocks();
    useCase = new UpdateClienteUseCase(mockClienteRepository, mockCacheService);
  });

  it('deve atualizar o nome de um cliente e invalidar o cache', async () => {
    const dto: UpdateClienteDto = { nome: 'Peter B. Parker' };
    mockClienteRepository.findById.mockResolvedValue(clienteExistente);
    const clienteAtualizado = new Cliente({
      nome: dto.nome ?? clienteExistente.nome,
      email: clienteExistente.email,
      telefone: clienteExistente.telefone,
    });
    mockClienteRepository.update.mockResolvedValue(clienteAtualizado);
    mockCacheService.del.mockResolvedValue();

    const result = await useCase.execute(clienteId, dto);

    expect(result.nome).toBe('Peter B. Parker');
    expect(mockClienteRepository.findById).toHaveBeenCalledWith(clienteId);
    expect(mockClienteRepository.update).toHaveBeenCalledWith(clienteId, dto);
    expect(mockCacheService.del).toHaveBeenCalledWith(`cliente:${clienteId}`);
  });

  it('deve lançar AppError se o cliente não for encontrado', async () => {
    const dto: UpdateClienteDto = { nome: 'Peter B. Parker' };
    mockClienteRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(AppError);
    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      'Cliente não encontrado.',
    );
    expect(mockCacheService.del).not.toHaveBeenCalled();
  });

  it('deve lançar AppError se o novo e-mail já estiver em uso por OUTRO cliente', async () => {
    const dto: UpdateClienteDto = { email: 'outro@cliente.com' };
    mockClienteRepository.findById.mockResolvedValue(clienteExistente);
    mockClienteRepository.findByEmail.mockResolvedValue(outroCliente);

    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(AppError);
    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      'O novo e-mail já está em uso.',
    );
    expect(mockClienteRepository.update).not.toHaveBeenCalled();
  });

  it('deve atualizar mesmo se o cache falhar ao invalidar (Resiliência)', async () => {
    const dto: UpdateClienteDto = { nome: 'Spider-Man' };
    mockClienteRepository.findById.mockResolvedValue(clienteExistente);
    mockClienteRepository.update.mockResolvedValue(
      new Cliente({
        ...clienteExistente,
        nome: dto.nome ?? clienteExistente.nome,
      }),
    );
    mockCacheService.del.mockRejectedValue(new Error('Redis indisponível'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await useCase.execute(clienteId, dto);

    expect(result.nome).toBe('Spider-Man');
    expect(mockClienteRepository.update).toHaveBeenCalledWith(clienteId, dto);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao invalidar o cache:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it('deve lançar AppError se o repositório retornar null ao atualizar', async () => {
    const dto: UpdateClienteDto = { nome: 'Spider-Man' };
    mockClienteRepository.findById.mockResolvedValue(clienteExistente);
    mockClienteRepository.update.mockResolvedValue(null);

    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(AppError);
    await expect(useCase.execute(clienteId, dto)).rejects.toThrow(
      'Cliente não pôde ser atualizado.',
    );
  });
});
