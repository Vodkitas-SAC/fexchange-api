import { IsString, IsDateString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreatePersonaRequest {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido_paterno: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido_materno: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento: Date;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  numero_telefono: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  tipo_documento: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  numero_documento: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nacionalidad: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  ocupacion: string;
}

export class UpdatePersonaRequest {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  nombres?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  apellido_paterno?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  apellido_materno?: string;

  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: Date;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  numero_telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  tipo_documento?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  numero_documento?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  nacionalidad?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  ocupacion?: string;
}