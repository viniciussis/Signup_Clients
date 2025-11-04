import {
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsString,
  IsEmail,
} from 'class-validator';

export class UpdateClienteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @IsOptional()
  nome?: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  telefone?: string;
}
