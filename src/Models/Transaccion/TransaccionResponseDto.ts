import { EstadoTransaccion, TipoCliente } from '../../DbModel/Enums';

/**
 * DTO de Respuesta para Transacciones - Datos Completos
 * 
 * Estructura optimizada para respuestas de API que incluye
 * todas las relaciones y datos necesarios para el frontend.
 */
export interface TransaccionResponseDto {
  id: number;
  numero_transaccion: string;
  monto_origen: number;
  monto_destino: number;
  tipo_cambio_aplicado: number;
  ganancia: number;
  estado: EstadoTransaccion;
  observaciones?: string;
  
  // IDs de relaciones
  cliente_id?: number;
  ventanilla_id: number;
  moneda_origen_id: number;
  moneda_destino_id: number;
  tipo_cambio_id: number;
  
  // Datos de cliente temporal (para transacciones sin cliente registrado)
  cliente_temporal?: {
    nombres?: string;
    apellidos?: string;
    documento?: string;
    descripcion?: string;
  };
  
  // Relaciones completas incluidas en la respuesta
  cliente?: {
    tipo: TipoCliente;
    descripcion: string;
    persona?: {
      nombres: string;
      apellido_paterno: string;
      apellido_materno: string;
    };
  };
  
  ventanilla: {
    identificador: string;
    nombre: string;
  };
  
  moneda_origen: {
    codigo: string;
    simbolo: string;
  };
  
  moneda_destino: {
    codigo: string;
    simbolo: string;
  };
  
  // Metadatos
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO para Respuestas de Cálculo de Conversión
 */
export interface CalcularConversionResponseDto {
  montoDestino: number;
  tipoCambio: number;
  ganancia: number;
  comision?: number;
  mensaje?: string;
}

/**
 * DTO para Respuestas de Verificación de Disponibilidad
 */
export interface VerificarDisponibilidadResponseDto {
  disponible: boolean;
  montoDisponible: number;
  mensaje?: string;
}

/**
 * DTO de Respuesta Estándar para API de Transacciones
 */
export interface TransaccionApiResponseDto<T = any> {
  message: string;
  data: T;
  errors?: Array<{
    property: string;
    constraints: Record<string, string>;
  }>;
  timestamp?: Date;
}