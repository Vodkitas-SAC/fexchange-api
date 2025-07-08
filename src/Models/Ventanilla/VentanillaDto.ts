import { IsString, IsEnum, IsNumber, IsBoolean, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { EstadoVentanilla } from '../../DbModel/Enums';

export class VentanillaDto {
  id?: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  identificador: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre: string;

  @IsEnum(EstadoVentanilla)
  @IsNotEmpty()
  estado: EstadoVentanilla;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;

  created_at?: Date;
  updated_at?: Date;
}