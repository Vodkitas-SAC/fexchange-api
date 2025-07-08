import { GenerarReporteGananciasRequest, ConsultarReporteRequest, ReporteTransaccionesRequest, ReporteRendimientoRequest } from '../Models/Reporte/ReporteRequestParams';
import { ReporteGananciasDto, ResumenTransaccionesDto, ReporteDiarioDto } from '../Models/Reporte/ReporteDto';

export interface IReporteService {
  /**
   * Genera un reporte de ganancias por período
   */
  generarReporteGanancias(request: GenerarReporteGananciasRequest): Promise<ReporteGananciasDto>;

  /**
   * Obtiene ganancias por día en un rango de fechas
   */
  getGananciasPorDia(
    fechaInicio: Date,
    fechaFin: Date,
    casaDeCambioId: number,
    ventanillaId?: number
  ): Promise<ReporteDiarioDto[]>;

  /**
   * Obtiene ganancias por semana en un rango de fechas
   */
  getGananciasPorSemana(
    fechaInicio: Date,
    fechaFin: Date,
    casaDeCambioId: number,
    ventanillaId?: number
  ): Promise<ReporteDiarioDto[]>;

  /**
   * Obtiene ganancias por mes en un rango de fechas
   */
  getGananciasPorMes(
    fechaInicio: Date,
    fechaFin: Date,
    casaDeCambioId: number,
    ventanillaId?: number
  ): Promise<ReporteDiarioDto[]>;

  /**
   * Obtiene ganancias por año en un rango de fechas
   */
  getGananciasPorAno(
    fechaInicio: Date,
    fechaFin: Date,
    casaDeCambioId: number,
    ventanillaId?: number
  ): Promise<ReporteDiarioDto[]>;

  /**
   * Obtiene un resumen de transacciones por período
   */
  getResumenTransacciones(request: ReporteTransaccionesRequest): Promise<ResumenTransaccionesDto>;

  /**
   * Obtiene las transacciones más rentables
   */
  getTransaccionesMasRentables(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date,
    limit?: number
  ): Promise<any[]>;

  /**
   * Obtiene estadísticas de rendimiento por ventanilla
   */
  getRendimientoPorVentanilla(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]>;

  /**
   * Obtiene estadísticas de conversiones por par de monedas
   */
  getEstadisticasPorMoneda(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]>;

  /**
   * Genera reporte de cumplimiento SBS
   */
  generarReporteSBS(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<{
    transacciones: any[];
    resumen: {
      total_operaciones: number;
      monto_total: number;
      clientes_registrados: number;
      clientes_no_registrados: number;
    };
  }>;
}