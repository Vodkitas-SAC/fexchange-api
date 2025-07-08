import { IsString, IsEmail, IsNumber, IsNotEmpty, Length } from 'class-validator';

export class CasaDeCambioDto {
  id?: number;

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

  activa?: boolean;

  created_at?: Date;
  updated_at?: Date;
}