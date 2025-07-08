import { IsString, IsNumber, IsEnum, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { TipoReporte } from '../../DbModel/Enums';

export class GenerarReporteGananciasRequest {
  @IsEnum(TipoReporte)
  @IsNotEmpty()
  tipo: TipoReporte;

  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string; // YYYY-MM-DD

  @IsDateString()
  @IsOptional()
  fecha_fin?: string; // YYYY-MM-DD (opcional para algunos tipos)

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;

  @IsNumber()
  @IsOptional()
  ventanilla_id?: number; // Para reportes específicos de ventanilla
}

export class ConsultarReporteRequest {
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_fin: string;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;

  @IsNumber()
  @IsOptional()
  ventanilla_id?: number;

  @IsNumber()
  @IsOptional()
  moneda_id?: number;
}

export class ReporteTransaccionesRequest {
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_fin: string;

  @IsNumber()
  @IsOptional()
  casa_de_cambio_id?: number;

  @IsNumber()
  @IsOptional()
  ventanilla_id?: number;

  @IsNumber()
  @IsOptional()
  cliente_id?: number;

  @IsString()
  @IsOptional()
  estado?: string; // COMPLETADA, CANCELADA, PENDIENTE

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  order_by?: string; // 'fecha', 'monto', 'ganancia'

  @IsString()
  @IsOptional()
  order_direction?: string; // 'ASC', 'DESC'
}

export class ReporteRendimientoRequest {
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_fin: string;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;

  @IsString()
  @IsOptional()
  granularidad?: string; // 'dia', 'semana', 'mes'
}