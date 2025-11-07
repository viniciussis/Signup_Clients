/* eslint-disable @typescript-eslint/unbound-method */
import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { ListClientesUseCase } from '@/application/use-cases/list-clientes.use-case';
import { Cliente } from '@/domain/entities/cliente.entity';

const mockClienteRepository: jest.Mocked<IClienteRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const clienteMock1 = new Cliente({
  nome: 'Cliente Um',
  email: 'um@teste.com',
  telefone: '111',
});
const clienteMock2 = new Cliente({
  nome: 'Cliente Dois',
  email: 'dois@teste.com',
  telefone: '222',
});
const mockClienteList = [clienteMock1, clienteMock2];

describe('ListClientesUseCase', () => {
  let useCase: ListClientesUseCase;

  beforeEach(() => {
    jest.resetAllMocks();
    useCase = new ListClientesUseCase(mockClienteRepository);
  });

  it('deve retornar uma lista de clientes', async () => {
    mockClienteRepository.findAll.mockResolvedValue(mockClienteList);

    const result = await useCase.execute();

    expect(result).toEqual(mockClienteList);
    expect(result.length).toBe(2);
    expect(mockClienteRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('deve retornar uma lista vazia se o repositório retornar vazio', async () => {
    mockClienteRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
    expect(mockClienteRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
