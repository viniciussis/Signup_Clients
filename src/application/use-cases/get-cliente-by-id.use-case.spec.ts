/* eslint-disable @typescript-eslint/unbound-method */
import { GetClienteByIdUseCase } from '@/application/use-cases/get-cliente-by-id.use-case';
import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { ICacheService } from '@/domain/services/cache.service.interface';
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
const clienteEntity = new Cliente({
  nome: 'Bruce Wayne',
  email: 'bruce@wayneenterprises.com',
  telefone: '9999-0000',
});
const plainClienteObject = {
  nome: 'Bruce Wayne',
  email: 'bruce@wayneenterprises.com',
  telefone: '9999-0000',
};

describe('GetClienteByIdUseCase', () => {
  let useCase: GetClienteByIdUseCase;

  beforeEach(() => {
    jest.resetAllMocks();
    useCase = new GetClienteByIdUseCase(
      mockClienteRepository,
      mockCacheService,
    );
  });

  it('deve retornar um cliente do cache (Cache Hit)', async () => {
    mockCacheService.get.mockResolvedValue(plainClienteObject);
    const cacheKey = `cliente:${clienteEntity._id}`;

    const result = await useCase.execute(clienteEntity._id);

    expect(result).toBeInstanceOf(Cliente);
    expect(result.nome).toBe(plainClienteObject.nome);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(mockClienteRepository.findById).not.toHaveBeenCalled();
    expect(mockCacheService.set).not.toHaveBeenCalled();
  });

  it('deve retornar um cliente do banco e salvar no cache (Cache Miss)', async () => {
    mockCacheService.get.mockResolvedValue(null);
    mockClienteRepository.findById.mockResolvedValue(clienteEntity);
    mockCacheService.set.mockResolvedValue();

    const cacheKey = `cliente:${clienteEntity._id}`;
    const result = await useCase.execute(clienteEntity._id);

    expect(result).toBe(clienteEntity);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(mockClienteRepository.findById).toHaveBeenCalledWith(
      clienteEntity._id,
    );
    expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, clienteEntity);
  });

  it('deve lançar AppError se o cliente não for encontrado (Cache Miss)', async () => {
    const invalidId = 'id-nao-existe';
    mockCacheService.get.mockResolvedValue(null);
    mockClienteRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(invalidId)).rejects.toThrow(AppError);
    await expect(useCase.execute(invalidId)).rejects.toThrow(
      'Cliente não encontrado.',
    );
    expect(mockCacheService.set).not.toHaveBeenCalled();
  });

  it('deve buscar do banco se o cache falhar ao ler (Resiliência)', async () => {
    mockCacheService.get.mockRejectedValue(new Error('Redis indisponível'));
    mockClienteRepository.findById.mockResolvedValue(clienteEntity);
    mockCacheService.set.mockResolvedValue();

    const result = await useCase.execute(clienteEntity._id);

    expect(result).toBe(clienteEntity);
    expect(mockClienteRepository.findById).toHaveBeenCalledWith(
      clienteEntity._id,
    );
  });

  it('deve retornar do banco mesmo se o cache falhar ao salvar (Resiliência)', async () => {
    mockCacheService.get.mockResolvedValue(null);
    mockClienteRepository.findById.mockResolvedValue(clienteEntity);
    mockCacheService.set.mockRejectedValue(
      new Error('Erro ao salvar no cache'),
    );
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await useCase.execute(clienteEntity._id);

    expect(result).toBe(clienteEntity);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao salvar no cache:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
