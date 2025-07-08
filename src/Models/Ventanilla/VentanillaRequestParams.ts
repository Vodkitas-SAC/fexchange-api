import { IsString, IsEnum, IsNumber, IsBoolean, IsNotEmpty, IsOptional, Length, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoVentanilla } from '../../DbModel/Enums';

export class CreateVentanillaRequest {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  identificador: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;
}

export class UpdateVentanillaRequest {
  @IsString()
  @IsOptional()
  @Length(1, 50)
  identificador?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  nombre?: string;

  @IsEnum(EstadoVentanilla)
  @IsOptional()
  estado?: EstadoVentanilla;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}

export class MontoAperturaRequest {
  @IsNumber()
  @IsNotEmpty()
  moneda_id: number;

  @IsNumber()
  @IsNotEmpty()
  monto: number;
}

export class AperturarVentanillaRequest {
  @IsNumber()
  @IsNotEmpty()
  usuario_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MontoAperturaRequest)
  montos_apertura: MontoAperturaRequest[];

  @IsString()
  @IsOptional()
  observaciones_apertura?: string;
}

export class CerrarVentanillaRequest {
  @IsNumber()
  @IsNotEmpty()
  usuario_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MontoAperturaRequest)
  montos_cierre: MontoAperturaRequest[];

  @IsString()
  @IsOptional()
  observaciones_cierre?: string;
}