import { IsString, IsEmail, IsNumber, IsNotEmpty, Length, IsOptional, IsBoolean } from 'class-validator';

export class CreateCasaDeCambioRequest {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  identificador: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  telefono: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  ruc: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  razon_social: string;

  @IsNumber()
  @IsNotEmpty()
  moneda_maestra_id: number;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}

export class UpdateCasaDeCambioRequest {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  identificador?: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  nombre?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  ruc?: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  razon_social?: string;

  @IsNumber()
  @IsOptional()
  moneda_maestra_id?: number;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}