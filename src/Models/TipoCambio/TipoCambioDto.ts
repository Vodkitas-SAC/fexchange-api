import { IsNumber, IsBoolean, IsDateString, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class TipoCambioDto {
  id?: number;

  @IsNumber()
  @Min(0)
  tipo_compra: number;

  @IsNumber()
  @Min(0)
  tipo_venta: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsDateString()
  @IsNotEmpty()
  fecha_vigencia: Date;

  @IsBoolean()
  @IsOptional()
  mantener_cambio_diario?: boolean;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;

  @IsNumber()
  @IsNotEmpty()
  moneda_origen_id: number;

  @IsNumber()
  @IsNotEmpty()
  moneda_destino_id: number;

  created_at?: Date;
  updated_at?: Date;
}