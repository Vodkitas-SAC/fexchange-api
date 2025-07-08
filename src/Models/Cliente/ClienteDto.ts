import { IsString, IsEnum, IsNumber, IsNotEmpty, IsOptional, Length, IsBoolean } from 'class-validator';
import { TipoCliente } from '../../DbModel/Enums';

export class ClienteDto {
  id?: number;

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

  persona?: {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    numero_documento: string;
    fecha_nacimiento?: Date;
    numero_telefono?: string;
    direccion?: string;
    tipo_documento?: string;
    nacionalidad?: string;
    ocupacion?: string;
  };

  created_at: Date;
  updated_at: Date;
}