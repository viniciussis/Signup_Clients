import { IClienteRepository } from '@/domain/repositories/cliente.repository.interface';
import { ListClientesUseCase } from './list-clientes.use-case';
import { Cliente } from '@/domain/entities/cliente.entity';
import { Test, TestingModule } from '@nestjs/testing';

const mockClienteRepository = {
  findAll: jest.fn(),
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

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListClientesUseCase,
        {
          provide: IClienteRepository,
          useValue: mockClienteRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListClientesUseCase>(ListClientesUseCase);
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
