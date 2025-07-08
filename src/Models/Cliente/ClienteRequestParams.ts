import { IsString, IsEnum, IsNumber, IsNotEmpty, IsOptional, Length, IsDateString, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoCliente } from '../../DbModel/Enums';
import { PersonaDto } from '../Persona/PersonaDto';

export class CreateClienteRequest {
  @IsEnum(TipoCliente)
  @IsNotEmpty()
  tipo: TipoCliente;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  ruc?: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  razon_social?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  estado_civil?: string;

  @IsString()
  @IsOptional()
  direccion_fiscal?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  profesion?: string;

  @IsBoolean()
  @IsOptional()
  es_activo?: boolean;

  @IsNumber()
  @IsOptional()
  persona_id?: number;
}

export class UpdateClienteRequest {
  @IsEnum(TipoCliente)
  @IsOptional()
  tipo?: TipoCliente;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  ruc?: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  razon_social?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  estado_civil?: string;

  @IsString()
  @IsOptional()
  direccion_fiscal?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  profesion?: string;

  @IsBoolean()
  @IsOptional()
  es_activo?: boolean;

  @IsNumber()
  @IsOptional()
  persona_id?: number;
}

export class CreateClienteRegistradoRequest {
  @ValidateNested()
  @Type(() => PersonaDto)
  @IsNotEmpty()
  persona: PersonaDto;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  ruc?: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  razon_social?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  estado_civil?: string;

  @IsString()
  @IsOptional()
  direccion_fiscal?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  profesion?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class CreateClienteOcasionalRequest {
  @IsString()
  @IsOptional()
  @Length(1, 200)
  descripcion?: string;
}

export class CreateClienteEmpresarialRequest {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  razon_social: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  ruc: string;

  @IsString()
  @IsNotEmpty()
  direccion_fiscal: string;

  @ValidateNested()
  @Type(() => PersonaDto)
  @IsNotEmpty()
  representante_legal: PersonaDto;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  descripcion?: string;
}