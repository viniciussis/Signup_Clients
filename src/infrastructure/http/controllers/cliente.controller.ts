import {
  HttpStatus,
  Controller,
  HttpCode,
  Delete,
  Param,
  Patch,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { GetClienteByIdUseCase } from '@/application/use-cases/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from '@/application/use-cases/update-cliente.use-case';
import { CreateClienteUseCase } from '@/application/use-cases/create-cliente.use-case';
import { DeleteClienteUseCase } from '@/application/use-cases/delete-cliente.use-case';
import { ListClientesUseCase } from '@/application/use-cases/list-clientes.use-case';
import { CreateClienteDto } from '@/application/dtos/create-cliente.dto';
import { UpdateClienteDto } from '@/application/dtos/update-cliente.dto';

@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly getClienteByIdUseCase: GetClienteByIdUseCase,
    private readonly listClientesUseCase: ListClientesUseCase,
    private readonly updateClienteUseCase: UpdateClienteUseCase,
    private readonly deleteClienteUseCase: DeleteClienteUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClienteDto: CreateClienteDto) {
    return this.createClienteUseCase.execute(createClienteDto);
  }

  @Get()
  async findAll() {
    return this.listClientesUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getClienteByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.updateClienteUseCase.execute(id, updateClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.deleteClienteUseCase.execute(id);
  }
}
