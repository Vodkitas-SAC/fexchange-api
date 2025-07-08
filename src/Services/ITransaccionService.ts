import { ProcesarCambioRequest } from '../Models/Transaccion/TransaccionRequestParams';
import { TransaccionDto } from '../Models/Transaccion/TransaccionDto';
import { TransaccionResponseDto } from '../Models/Transaccion/TransaccionResponseDto';

/**
 * Interfaz del Servicio de Transacciones
 * 
 * Define los métodos requeridos para la gestión de transacciones
 * de cambio de moneda con soporte para operaciones rápidas.
 */
export interface ITransaccionService {
  /**
   * Procesa una transacción de cambio de moneda
   */
  procesarCambio(request: ProcesarCambioRequest): Promise<TransaccionDto>;

  /**
   * Obtiene transacciones por ventanilla (método principal en español)
   */
  obtenerPorVentanilla(ventanillaId: number, fecha?: Date): Promise<TransaccionDto[]>;

  /**
   * Obtiene transacciones por cliente (método principal en español)
   */
  obtenerPorCliente(clienteId: number): Promise<TransaccionDto[]>;

  /**
   * Obtiene una transacción por número (método principal en español)
   */
  obtenerPorNumero(numeroTransaccion: string): Promise<TransaccionDto | null>;

  /**
   * Obtiene todas las transacciones con filtros
   */
  obtenerTodas(filtros?: {
    limit?: number;
    offset?: number;
    ordenar?: string;
    ventanillaId?: number;
  }): Promise<TransaccionResponseDto[]>;

  /**
   * Cancela una transacción
   */
  cancelar(id: number, motivo: string): Promise<boolean>;

  /**
   * Calcula el monto de conversión
   */
  calcularConversion(
    montoOrigen: number,
    monedaOrigenId: number,
    monedaDestinoId: number,
    casaDeCambioId: number
  ): Promise<{ montoDestino: number; tipoCambio: number; ganancia: number }>;

  /**
   * Verifica si la ventanilla tiene suficiente dinero
   */
  verificarDisponibilidad(
    ventanillaId: number,
    monedaId: number,
    monto: number
  ): Promise<boolean>;

  // Métodos de compatibilidad - @deprecated
  getByVentanilla(ventanillaId: number, fecha?: Date): Promise<TransaccionDto[]>;
  getByCliente(clienteId: number): Promise<TransaccionDto[]>;
  getByNumero(numeroTransaccion: string): Promise<TransaccionDto | null>;
}