import { IsNumber, IsBoolean, IsDateString, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateTipoCambioRequest {
  @IsNumber()
  @Min(0.01, { message: 'El tipo de compra debe ser mayor a 0.01' })
  tipo_compra: number;

  @IsNumber()
  @Min(0.01, { message: 'El tipo de venta debe ser mayor a 0.01' })
  tipo_venta: number;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;

  @IsNumber()
  @IsNotEmpty()
  moneda_origen_id: number;

  @IsNumber()
  @IsNotEmpty()
  moneda_destino_id: number;

  @IsBoolean()
  @IsOptional()
  mantener_cambio_diario?: boolean;
}

export class UpdateTipoCambioRequest {
  @IsNumber()
  @IsOptional()
  @Min(0.01, { message: 'El tipo de compra debe ser mayor a 0.01' })
  tipo_compra?: number;

  @IsNumber()
  @IsOptional()
  @Min(0.01, { message: 'El tipo de venta debe ser mayor a 0.01' })
  tipo_venta?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsDateString()
  @IsOptional()
  fecha_vigencia?: Date;

  @IsBoolean()
  @IsOptional()
  mantener_cambio_diario?: boolean;
}

export class ConsultarTipoCambioRequest {
  @IsNumber()
  @IsNotEmpty()
  moneda_origen_id: number;

  @IsNumber()
  @IsNotEmpty()
  moneda_destino_id: number;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;

  @IsDateString()
  @IsOptional()
  fecha?: Date;
}