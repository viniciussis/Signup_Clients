/* eslint-disable @typescript-eslint/unbound-method */
import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { DeleteClienteUseCase } from '@/application/use-cases/delete-cliente.use-case';
import { ICacheService } from '@/domain/services/cache.service.interface';
import { AppError } from '@/infrastructure/http/errors/AppError';

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

describe('DeleteClienteUseCase', () => {
  let useCase: DeleteClienteUseCase;

  beforeEach(() => {
    jest.resetAllMocks();
    useCase = new DeleteClienteUseCase(mockClienteRepository, mockCacheService);
  });

  it('deve deletar um cliente e invalidar o cache com sucesso', async () => {
    const clienteId = 'some-valid-id';
    mockClienteRepository.delete.mockResolvedValue(true);
    mockCacheService.del.mockResolvedValue();

    await expect(useCase.execute(clienteId)).resolves.toBeUndefined();

    expect(mockClienteRepository.delete).toHaveBeenCalledWith(clienteId);
    expect(mockCacheService.del).toHaveBeenCalledWith(`cliente:${clienteId}`);
  });

  it('deve lançar AppError se o cliente não for encontrado', async () => {
    const clienteId = 'some-invalid-id';
    mockClienteRepository.delete.mockResolvedValue(false);

    await expect(useCase.execute(clienteId)).rejects.toThrow(AppError);
    await expect(useCase.execute(clienteId)).rejects.toThrow(
      'Cliente não encontrado.',
    );

    expect(mockCacheService.del).not.toHaveBeenCalled();
  });

  it('deve deletar o cliente mesmo se a invalidação do cache falhar', async () => {
    const clienteId = 'some-valid-id';
    mockClienteRepository.delete.mockResolvedValue(true);
    const cacheError = new Error('Erro no Redis');
    mockCacheService.del.mockRejectedValue(cacheError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(useCase.execute(clienteId)).resolves.toBeUndefined();

    expect(mockClienteRepository.delete).toHaveBeenCalledWith(clienteId);
    expect(mockCacheService.del).toHaveBeenCalledWith(`cliente:${clienteId}`);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Falha ao invalidar cache para cliente deletado: ${clienteId}`,
      cacheError,
    );

    consoleErrorSpy.mockRestore();
  });
});
