import { VentanillaDto } from '../Models/Ventanilla/VentanillaDto';
import { CreateVentanillaRequest, UpdateVentanillaRequest, AperturarVentanillaRequest } from '../Models/Ventanilla/VentanillaRequestParams';
import { CierreVentanillaRequest } from '../Models/Ventanilla/CierreVentanillaRequestParams';
import { CierreVentanillaResumenDto } from '../Models/Ventanilla/CierreVentanillaDto';
import { AperturaVentanilla } from '../DbModel/Entities/AperturaVentanilla';
import { CierreVentanilla } from '../DbModel/Entities/CierreVentanilla';

export interface IVentanillaService {
  /**
   * Crea una nueva ventanilla
   */
  create(request: CreateVentanillaRequest): Promise<VentanillaDto>;

  /**
   * Obtiene todas las ventanillas del sistema
   */
  getAll(): Promise<VentanillaDto[]>;

  /**
   * Obtiene todas las ventanillas de una casa de cambio
   */
  getByCasaDeCambio(casaDeCambioId: number): Promise<VentanillaDto[]>;

  /**
   * Obtiene ventanillas por estado
   */
  getByEstado(casaDeCambioId: number, estado: string): Promise<VentanillaDto[]>;

  /**
   * Obtiene una ventanilla por ID
   */
  getById(id: number): Promise<VentanillaDto | null>;

  /**
   * Obtiene una ventanilla por identificador
   */
  getByIdentificador(identificador: string): Promise<VentanillaDto | null>;

  /**
   * Actualiza una ventanilla
   */
  update(id: number, request: UpdateVentanillaRequest): Promise<VentanillaDto | null>;

  /**
   * Activa o desactiva una ventanilla
   */
  toggleActive(id: number): Promise<VentanillaDto | null>;

  /**
   * Apertura una ventanilla
   */
  aperturar(ventanillaId: number, request: AperturarVentanillaRequest): Promise<AperturaVentanilla>;

  /**
   * Cierra una ventanilla
   */
  cerrar(ventanillaId: number, request: CierreVentanillaRequest): Promise<CierreVentanilla>;

  /**
   * Pausa temporalmente una ventanilla
   */
  pausar(ventanillaId: number, usuarioId: number): Promise<VentanillaDto | null>;

  /**
   * Reanuda una ventanilla pausada
   */
  reanudar(ventanillaId: number, usuarioId: number): Promise<VentanillaDto | null>;

  /**
   * Verifica si una ventanilla puede procesar una transacción
   */
  puedeAtender(ventanillaId: number): Promise<boolean>;

  /**
   * Obtiene el historial de aperturas/cierres de una ventanilla
   */
  getHistorial(ventanillaId: number, fechaInicio?: Date, fechaFin?: Date): Promise<{
    aperturas: AperturaVentanilla[];
    cierres: CierreVentanilla[];
  }>;

  /**
   * Obtiene la apertura activa de una ventanilla
   */
  getAperturaActiva(ventanillaId: number): Promise<AperturaVentanilla | null>;

  /**
   * Verifica disponibilidad de montos en una ventanilla
   */
  verificarDisponibilidadMontos(ventanillaId: number, monedaId: number, monto: number): Promise<boolean>;

  /**
   * Obtiene el resumen automático para cerrar una ventanilla
   */
  getResumenCierre(ventanillaId: number): Promise<CierreVentanillaResumenDto>;

  /**
   * Elimina una ventanilla (solo si no tiene transacciones)
   */
  delete(id: number): Promise<boolean>;
}