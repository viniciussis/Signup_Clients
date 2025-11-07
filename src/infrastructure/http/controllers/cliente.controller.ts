import { GetClienteByIdUseCase } from '@/application/use-cases/get-cliente-by-id.use-case';
import { CreateClienteUseCase } from '@/application/use-cases/create-cliente.use-case';
import { DeleteClienteUseCase } from '@/application/use-cases/delete-cliente.use-case';
import { UpdateClienteUseCase } from '@/application/use-cases/update-cliente.use-case';
import { ListClientesUseCase } from '@/application/use-cases/list-clientes.use-case';
import { UpdateClienteDto } from '@/application/dtos/update-cliente.dto';
import { CreateClienteDto } from '@/application/dtos/create-cliente.dto';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

export class ClienteController {
  constructor(
    private readonly getClienteByIdUseCase: GetClienteByIdUseCase,
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly updateClienteUseCase: UpdateClienteUseCase,
    private readonly deleteClienteUseCase: DeleteClienteUseCase,
    private readonly listClientesUseCase: ListClientesUseCase,
  ) {}

  create = async (req: Request, res: Response) => {
    const cliente = await this.createClienteUseCase.execute(
      req.body as CreateClienteDto,
    );
    return res.status(StatusCodes.CREATED).json(cliente);
  };

  findAll = async (req: Request, res: Response) => {
    const clientes = await this.listClientesUseCase.execute();
    return res.status(StatusCodes.OK).json(clientes);
  };

  findOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    const cliente = await this.getClienteByIdUseCase.execute(id);
    return res.status(StatusCodes.OK).json(cliente);
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const cliente = await this.updateClienteUseCase.execute(
      id,
      req.body as UpdateClienteDto,
    );
    return res.status(StatusCodes.OK).json(cliente);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteClienteUseCase.execute(id);
    return res.status(StatusCodes.NO_CONTENT).send();
  };
}
