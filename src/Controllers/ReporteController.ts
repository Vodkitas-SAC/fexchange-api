import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { ReporteService } from '../Services/Implementation/ReporteService';
import { 
  GenerarReporteGananciasRequest, 
  ConsultarReporteRequest,
  ReporteTransaccionesRequest,
  ReporteRendimientoRequest
} from '../Models/Reporte/ReporteRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class ReporteController {
  private reporteService: ReporteService;

  constructor() {
    this.reporteService = new ReporteService();
  }

  /**
   * Genera un reporte de ganancias por período
   */
  generarReporteGanancias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new GenerarReporteGananciasRequest(), req.body);
      const errors = await validate(request);

      if (errors.length > 0) {
        res.status(400).json({
          message: 'Datos de entrada inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const reporte = await this.reporteService.generarReporteGanancias(request);

      res.status(200).json({
        message: 'Reporte de ganancias generado exitosamente',
        data: reporte,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene ganancias por día
   */
  getGananciasPorDia = async (req: Request, res: Response): Promise<void> => {
    try {
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);
      const casaDeCambioId = parseInt(req.query.casaDeCambioId as string);
      const ventanillaId = req.query.ventanillaId ? parseInt(req.query.ventanillaId as string) : undefined;

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: fechaInicio, fechaFin, casaDeCambioId',
        });
        return;
      }

      const ganancias = await this.reporteService.getGananciasPorDia(
        fechaInicio,
        fechaFin,
        casaDeCambioId,
        ventanillaId
      );

      res.status(200).json({
        message: 'Ganancias por día obtenidas exitosamente',
        data: ganancias,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene ganancias por semana
   */
  getGananciasPorSemana = async (req: Request, res: Response): Promise<void> => {
    try {
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);
      const casaDeCambioId = parseInt(req.query.casaDeCambioId as string);
      const ventanillaId = req.query.ventanillaId ? parseInt(req.query.ventanillaId as string) : undefined;

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: fechaInicio, fechaFin, casaDeCambioId',
        });
        return;
      }

      const ganancias = await this.reporteService.getGananciasPorSemana(
        fechaInicio,
        fechaFin,
        casaDeCambioId,
        ventanillaId
      );

      res.status(200).json({
        message: 'Ganancias por semana obtenidas exitosamente',
        data: ganancias,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene ganancias por mes
   */
  getGananciasPorMes = async (req: Request, res: Response): Promise<void> => {
    try {
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);
      const casaDeCambioId = parseInt(req.query.casaDeCambioId as string);
      const ventanillaId = req.query.ventanillaId ? parseInt(req.query.ventanillaId as string) : undefined;

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: fechaInicio, fechaFin, casaDeCambioId',
        });
        return;
      }

      const ganancias = await this.reporteService.getGananciasPorMes(
        fechaInicio,
        fechaFin,
        casaDeCambioId,
        ventanillaId
      );

      res.status(200).json({
        message: 'Ganancias por mes obtenidas exitosamente',
        data: ganancias,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene ganancias por año
   */
  getGananciasPorAno = async (req: Request, res: Response): Promise<void> => {
    try {
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);
      const casaDeCambioId = parseInt(req.query.casaDeCambioId as string);
      const ventanillaId = req.query.ventanillaId ? parseInt(req.query.ventanillaId as string) : undefined;

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: fechaInicio, fechaFin, casaDeCambioId',
        });
        return;
      }

      const ganancias = await this.reporteService.getGananciasPorAno(
        fechaInicio,
        fechaFin,
        casaDeCambioId,
        ventanillaId
      );

      res.status(200).json({
        message: 'Ganancias por año obtenidas exitosamente',
        data: ganancias,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene un resumen de transacciones
   */
  getResumenTransacciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new ReporteTransaccionesRequest(), req.query);
      const errors = await validate(request);

      if (errors.length > 0) {
        res.status(400).json({
          message: 'Parámetros de consulta inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const resumen = await this.reporteService.getResumenTransacciones(request);

      res.status(200).json({
        message: 'Resumen de transacciones obtenido exitosamente',
        data: resumen,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene las transacciones más rentables
   */
  getTransaccionesMasRentables = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: casaDeCambioId, fechaInicio, fechaFin',
        });
        return;
      }

      const transacciones = await this.reporteService.getTransaccionesMasRentables(
        casaDeCambioId,
        fechaInicio,
        fechaFin,
        limit
      );

      res.status(200).json({
        message: 'Transacciones más rentables obtenidas exitosamente',
        data: transacciones,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene estadísticas de rendimiento por ventanilla
   */
  getRendimientoPorVentanilla = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: casaDeCambioId, fechaInicio, fechaFin',
        });
        return;
      }

      const rendimiento = await this.reporteService.getRendimientoPorVentanilla(
        casaDeCambioId,
        fechaInicio,
        fechaFin
      );

      res.status(200).json({
        message: 'Rendimiento por ventanilla obtenido exitosamente',
        data: rendimiento,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene estadísticas de conversiones por moneda
   */
  getEstadisticasPorMoneda = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: casaDeCambioId, fechaInicio, fechaFin',
        });
        return;
      }

      const estadisticas = await this.reporteService.getEstadisticasPorMoneda(
        casaDeCambioId,
        fechaInicio,
        fechaFin
      );

      res.status(200).json({
        message: 'Estadísticas por moneda obtenidas exitosamente',
        data: estadisticas,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Genera reporte de cumplimiento SBS
   */
  generarReporteSBS = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: casaDeCambioId, fechaInicio, fechaFin',
        });
        return;
      }

      const reporteSBS = await this.reporteService.generarReporteSBS(
        casaDeCambioId,
        fechaInicio,
        fechaFin
      );

      res.status(200).json({
        message: 'Reporte SBS generado exitosamente',
        data: reporteSBS,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene dashboard general con métricas clave
   */
  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.query.casaDeCambioId as string);
      const fechaInicio = new Date(req.query.fechaInicio as string);
      const fechaFin = new Date(req.query.fechaFin as string);

      if (isNaN(casaDeCambioId) || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          message: 'Parámetros requeridos: casaDeCambioId, fechaInicio, fechaFin',
        });
        return;
      }

      // Obtener métricas clave en paralelo
      const [
        resumenTransacciones,
        rendimientoVentanillas,
        estadisticasMonedas,
        transaccionesRentables,
        gananciasPorDia
      ] = await Promise.all([
        this.reporteService.getResumenTransacciones({
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          fecha_fin: fechaFin.toISOString().split('T')[0],
          casa_de_cambio_id: casaDeCambioId,
        }),
        this.reporteService.getRendimientoPorVentanilla(casaDeCambioId, fechaInicio, fechaFin),
        this.reporteService.getEstadisticasPorMoneda(casaDeCambioId, fechaInicio, fechaFin),
        this.reporteService.getTransaccionesMasRentables(casaDeCambioId, fechaInicio, fechaFin, 5),
        this.reporteService.getGananciasPorDia(fechaInicio, fechaFin, casaDeCambioId),
      ]);

      const dashboard = {
        resumen: resumenTransacciones,
        rendimiento_ventanillas: rendimientoVentanillas,
        estadisticas_monedas: estadisticasMonedas,
        transacciones_rentables: transaccionesRentables,
        tendencia_ganancias: gananciasPorDia,
        periodo: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
      };

      res.status(200).json({
        message: 'Dashboard obtenido exitosamente',
        data: dashboard,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };
}