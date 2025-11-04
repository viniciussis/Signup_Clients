import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { DeleteClienteUseCase } from './delete-cliente.use-case';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

const mockClienteRepository = {
  delete: jest.fn(),
};

const mockCacheManager = {
  del: jest.fn(),
};

describe('DeleteClienteUseCase', () => {
  let useCase: DeleteClienteUseCase;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClienteUseCase,
        {
          provide: IClienteRepository,
          useValue: mockClienteRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    useCase = module.get<DeleteClienteUseCase>(DeleteClienteUseCase);
  });

  it('deve deletar um cliente e invalidar o cache com sucesso', async () => {
    const clienteId = 'some-valid-id';

    mockClienteRepository.delete.mockResolvedValue(true);

    mockCacheManager.del.mockResolvedValue(undefined);

    await expect(useCase.execute(clienteId)).resolves.toBeUndefined();

    expect(mockClienteRepository.delete).toHaveBeenCalledWith(clienteId);

    expect(mockCacheManager.del).toHaveBeenCalledWith(`cliente:${clienteId}`);
  });

  it('deve lançar NotFoundException se o cliente não for encontrado', async () => {
    const clienteId = 'some-invalid-id';

    mockClienteRepository.delete.mockResolvedValue(false);

    await expect(useCase.execute(clienteId)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(clienteId)).rejects.toThrow(
      'Cliente não encontrado.',
    );

    expect(mockCacheManager.del).not.toHaveBeenCalled();
  });

  it('deve deletar o cliente mesmo se a invalidação do cache falhar', async () => {
    const clienteId = 'some-valid-id';

    mockClienteRepository.delete.mockResolvedValue(true);

    const cacheError = new Error('Erro no Redis');
    mockCacheManager.del.mockRejectedValue(cacheError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(useCase.execute(clienteId)).resolves.toBeUndefined();

    expect(mockClienteRepository.delete).toHaveBeenCalledWith(clienteId);

    expect(mockCacheManager.del).toHaveBeenCalledWith(`cliente:${clienteId}`);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Falha ao invalidar cache para cliente deletado: ${clienteId}`,
      cacheError,
    );

    consoleErrorSpy.mockRestore();
  });
});
