import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { GetClienteByIdUseCase } from './get-cliente-by-id.use-case';
import { Cliente } from '@/domain/entities/cliente.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

const mockClienteRepository = {
  findById: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

const clienteEntity = new Cliente(
  {
    nome: 'Diana Prince',
    email: 'diana@themyscira.com',
    telefone: '555-0300',
  },
  {
    _id: 'cliente-id-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
);

const plainClienteObject = {
  _id: 'cliente-id-123',
  nome: 'Diana Prince',
  email: 'diana@themyscira.com',
  telefone: '555-0300',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('GetClienteByIdUseCase', () => {
  let useCase: GetClienteByIdUseCase;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClienteByIdUseCase,
        { provide: IClienteRepository, useValue: mockClienteRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    useCase = module.get<GetClienteByIdUseCase>(GetClienteByIdUseCase);
  });

  it('deve retornar um cliente do cache (Cache Hit)', async () => {
    mockCacheManager.get.mockResolvedValue(plainClienteObject);
    const cacheKey = `cliente:${clienteEntity._id}`;

    const result = await useCase.execute(clienteEntity._id);

    expect(result).toBeInstanceOf(Cliente);
    expect(result.nome).toBe(plainClienteObject.nome);

    expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
    expect(mockClienteRepository.findById).not.toHaveBeenCalled();
    expect(mockCacheManager.set).not.toHaveBeenCalled();
  });

  it('deve retornar um cliente do banco e salvar no cache (Cache Miss)', async () => {
    mockCacheManager.get.mockResolvedValue(null);
    mockClienteRepository.findById.mockResolvedValue(clienteEntity);
    mockCacheManager.set.mockResolvedValue(undefined);

    const cacheKey = `cliente:${clienteEntity._id}`;

    const result = await useCase.execute(clienteEntity._id);

    expect(result).toBe(clienteEntity);

    expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
    expect(mockClienteRepository.findById).toHaveBeenCalledWith(
      clienteEntity._id,
    );
    expect(mockCacheManager.set).toHaveBeenCalledWith(cacheKey, clienteEntity);
  });

  it('deve lançar NotFoundException se o cliente não for encontrado (Cache Miss)', async () => {
    const invalidId = 'id-nao-existe';
    mockCacheManager.get.mockResolvedValue(null);
    mockClienteRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(invalidId)).rejects.toThrow(NotFoundException);

    expect(mockCacheManager.set).not.toHaveBeenCalled();
  });

  it('deve buscar do banco se o cache falhar ao ler (Resiliência)', async () => {
    const cacheError = new Error('Erro ao conectar no Redis');
    mockCacheManager.get.mockRejectedValue(cacheError);
    mockClienteRepository.findById.mockResolvedValue(clienteEntity);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await useCase.execute(clienteEntity._id);

    expect(result).toBe(clienteEntity);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao consultar o cache:',
      cacheError,
    );

    expect(mockClienteRepository.findById).toHaveBeenCalled();
    expect(mockCacheManager.set).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('deve retornar do banco mesmo se o cache falhar ao salvar (Resiliência)', async () => {
    const cacheError = new Error('Erro ao salvar no Redis');
    mockCacheManager.get.mockResolvedValue(null);
    mockClienteRepository.findById.mockResolvedValue(clienteEntity);
    mockCacheManager.set.mockRejectedValue(cacheError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await useCase.execute(clienteEntity._id);

    expect(result).toBe(clienteEntity);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao salvar no cache:',
      cacheError,
    );

    consoleErrorSpy.mockRestore();
  });
});
