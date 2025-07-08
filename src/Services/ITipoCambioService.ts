import { CreateTipoCambioRequest, UpdateTipoCambioRequest, ConsultarTipoCambioRequest } from '../Models/TipoCambio/TipoCambioRequestParams';
import { TipoCambioDto } from '../Models/TipoCambio/TipoCambioDto';

export interface ITipoCambioService {
  /**
   * Crea un nuevo tipo de cambio
   */
  create(request: CreateTipoCambioRequest): Promise<TipoCambioDto>;

  /**
   * Obtiene un tipo de cambio por ID
   */
  getById(id: number): Promise<TipoCambioDto | null>;

  /**
   * Obtiene todos los tipos de cambio activos
   */
  getAll(): Promise<TipoCambioDto[]>;

  /**
   * Obtiene tipos de cambio por casa de cambio
   */
  getByCasaDeCambio(casaDeCambioId: number): Promise<TipoCambioDto[]>;

  /**
   * Obtiene el tipo de cambio vigente para una conversión específica
   */
  getTipoCambioVigente(request: ConsultarTipoCambioRequest): Promise<TipoCambioDto | null>;

  /**
   * Obtiene el historial de tipos de cambio para una conversión
   */
  getHistorial(
    monedaOrigenId: number,
    monedaDestinoId: number,
    casaDeCambioId: number,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<TipoCambioDto[]>;

  /**
   * Actualiza un tipo de cambio
   */
  update(id: number, request: UpdateTipoCambioRequest): Promise<TipoCambioDto>;

  /**
   * Desactiva un tipo de cambio
   */
  desactivar(id: number): Promise<boolean>;

  /**
   * Activa un tipo de cambio
   */
  activar(id: number): Promise<boolean>;

  /**
   * Elimina un tipo de cambio
   */
  delete(id: number): Promise<boolean>;

  /**
   * Verifica si un tipo de cambio está disponible
   */
  isDisponible(
    monedaOrigenId: number,
    monedaDestinoId: number,
    casaDeCambioId: number,
    fecha?: Date
  ): Promise<boolean>;

  /**
   * Obtiene todos los pares de monedas disponibles para una casa de cambio
   */
  getParesDisponibles(casaDeCambioId: number): Promise<{
    moneda_origen: any;
    moneda_destino: any;
    tipo_cambio: TipoCambioDto;
  }[]>;

  /**
   * Obtiene los tipos de cambio actuales para el dashboard
   */
  getTiposCambioActuales(casaDeCambioId?: number): Promise<{
    par_monedas: string;
    compra: number;
    venta: number;
    ultima_actualizacion: Date;
    moneda_origen: any;
    moneda_destino: any;
  }[]>;

  /**
   * Obtiene tipos de cambio activos por casa de cambio con formato para operaciones rápidas
   */
  getActivosPorCasa(casaDeCambioId: number): Promise<{
    id: number;
    par_monedas: string;
    tipo_compra: number;
    tipo_venta: number;
    moneda_origen_id: number;
    moneda_destino_id: number;
    moneda_origen: {
      codigo: string;
      simbolo: string;
    };
    moneda_destino: {
      codigo: string;
      simbolo: string;
    };
  }[]>;
}