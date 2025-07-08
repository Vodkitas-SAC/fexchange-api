import { IsString, IsNumber, IsEnum, IsDateString, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { TipoReporte } from '../../DbModel/Enums';

export class ReporteGananciasDto {
  @IsEnum(TipoReporte)
  @IsNotEmpty()
  tipo: TipoReporte;

  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: Date;

  @IsDateString()
  @IsNotEmpty()
  fecha_fin: Date;

  @IsNumber()
  @Min(0)
  ganancia_total: number;

  @IsNumber()
  @Min(0)
  total_transacciones: number;

  @IsNumber()
  @Min(0)
  monto_total_operado: number;

  @IsNumber()
  @IsOptional()
  casa_de_cambio_id?: number;

  @IsNumber()
  @IsOptional()
  ventanilla_id?: number;

  ventanillas?: ReporteVentanillaDto[];
  monedas?: ReporteMonedaDto[];
  transacciones_por_dia?: ReporteDiarioDto[];

  created_at?: Date;
}

export class ReporteVentanillaDto {
  @IsNumber()
  @IsNotEmpty()
  ventanilla_id: number;

  @IsString()
  @IsNotEmpty()
  ventanilla_nombre: string;

  @IsNumber()
  @Min(0)
  ganancia: number;

  @IsNumber()
  @Min(0)
  total_transacciones: number;

  @IsNumber()
  @Min(0)
  monto_operado: number;
}

export class ReporteMonedaDto {
  @IsNumber()
  @IsNotEmpty()
  moneda_id: number;

  @IsString()
  @IsNotEmpty()
  moneda_codigo: string;

  @IsString()
  @IsNotEmpty()
  moneda_nombre: string;

  @IsNumber()
  @Min(0)
  monto_origen: number;

  @IsNumber()
  @Min(0)
  monto_destino: number;

  @IsNumber()
  @Min(0)
  ganancia: number;

  @IsNumber()
  @Min(0)
  total_transacciones: number;
}

export class ReporteDiarioDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: Date;

  @IsNumber()
  @Min(0)
  ganancia: number;

  @IsNumber()
  @Min(0)
  total_transacciones: number;

  @IsNumber()
  @Min(0)
  monto_operado: number;
}

export class ResumenTransaccionesDto {
  @IsNumber()
  @Min(0)
  total_completadas: number;

  @IsNumber()
  @Min(0)
  total_canceladas: number;

  @IsNumber()
  @Min(0)
  total_pendientes: number;

  @IsNumber()
  @Min(0)
  monto_total_completadas: number;

  @IsNumber()
  @Min(0)
  ganancia_total: number;

  transacciones_mas_grandes?: {
    numero_transaccion: string;
    monto_origen: number;
    monto_destino: number;
    ganancia: number;
    fecha: Date;
  }[];
}