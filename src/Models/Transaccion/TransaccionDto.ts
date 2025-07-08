import { IsString, IsNumber, IsEnum, IsNotEmpty, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoTransaccion, TipoCliente } from '../../DbModel/Enums';

/**
 * DTO para Transacciones - Transferencia de Datos de Transacciones
 * 
 * Define la estructura de datos para transacciones de cambio de moneda
 * con validaciones completas y soporte para clientes temporales.
 */

export class TransaccionDto {
  id?: number;

  @IsString()
  @IsNotEmpty()
  numero_transaccion: string;

  @IsNumber()
  @Min(0)
  monto_origen: number;

  @IsNumber()
  @Min(0)
  monto_destino: number;

  @IsNumber()
  @Min(0)
  tipo_cambio_aplicado: number;

  @IsNumber()
  @Min(0)
  ganancia: number;

  @IsEnum(EstadoTransaccion)
  @IsNotEmpty()
  estado: EstadoTransaccion;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsNumber()
  @IsOptional()
  cliente_id?: number;

  // Datos de cliente temporal para transacciones sin cliente registrado
  cliente_temporal?: {
    nombres?: string;
    apellidos?: string;
    documento?: string;
    descripcion?: string;
  };

  // Relaciones incluidas en respuestas extendidas
  cliente?: {
    tipo: TipoCliente;
    descripcion: string;
    persona?: {
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
    };
  };

  ventanilla?: {
    identificador: string;
    nombre: string;
  };

  moneda_origen?: {
    codigo: string;
    simbolo: string;
  };

  moneda_destino?: {
    codigo: string;
    simbolo: string;
  };

  @IsNumber()
  @IsNotEmpty()
  ventanilla_id: number;

  @IsNumber()
  @IsNotEmpty()
  moneda_origen_id: number;

  @IsNumber()
  @IsNotEmpty()
  moneda_destino_id: number;

  @IsNumber()
  @IsNotEmpty()
  tipo_cambio_id: number;

  created_at: Date;
  updated_at: Date;
}