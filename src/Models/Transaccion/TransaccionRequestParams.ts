import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Parámetros de Solicitud para Transacciones - Validación de Datos
 * 
 * Define todas las clases de validación para las diferentes
 * operaciones de transacciones de cambio de moneda.
 */

/**
 * Datos de cliente temporal para transacciones rápidas
 */
class ClienteTemporalData {
  @IsString()
  @IsOptional()
  nombres?: string;

  @IsString()
  @IsOptional()
  apellidos?: string;

  @IsString()
  @IsOptional()
  documento?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

/**
 * Solicitud para procesar una transacción de cambio
 */
export class ProcesarCambioRequest {
  @IsNumber()
  @IsOptional()
  clienteId?: number;

  @ValidateNested()
  @Type(() => ClienteTemporalData)
  @IsOptional()
  clienteTemp?: ClienteTemporalData;

  @IsNumber()
  @IsNotEmpty()
  ventanillaId: number;

  @IsNumber()
  @IsNotEmpty()
  monedaOrigenId: number;

  @IsNumber()
  @IsNotEmpty()
  monedaDestinoId: number;

  @IsNumber()
  @Min(0.01)
  montoOrigen: number;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsNotEmpty()
  tipoOperacion: 'COMPRA' | 'VENTA';
}

/**
 * Solicitud para cancelar una transacción
 */
export class CancelarTransaccionRequest {
  @IsString()
  @IsNotEmpty()
  motivo: string;
}

/**
 * Solicitud para calcular una conversión de moneda
 */
export class CalcularConversionRequest {
  @IsNumber()
  @Min(0.01)
  montoOrigen: number;

  @IsNumber()
  @IsNotEmpty()
  monedaOrigenId: number;

  @IsNumber()
  @IsNotEmpty()
  monedaDestinoId: number;

  @IsNumber()
  @IsNotEmpty()
  casaDeCambioId: number;
}

/**
 * Solicitud para verificar disponibilidad de fondos
 */
export class VerificarDisponibilidadRequest {
  @IsNumber()
  @IsNotEmpty()
  ventanillaId: number;

  @IsNumber()
  @IsNotEmpty()
  monedaId: number;

  @IsNumber()
  @Min(0.01)
  monto: number;
}

/**
 * Solicitud para consultar transacciones con filtros
 */
export class ConsultarTransaccionesRequest {
  @IsNumber()
  @IsOptional()
  ventanillaId?: number;

  @IsNumber()
  @IsOptional()
  clienteId?: number;

  @IsString()
  @IsOptional()
  fechaInicio?: string; // YYYY-MM-DD

  @IsString()
  @IsOptional()
  fechaFin?: string; // YYYY-MM-DD

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}