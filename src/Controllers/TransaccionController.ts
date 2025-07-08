import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { TransaccionService } from '../Services/Implementation/TransaccionService';
import { 
  ProcesarCambioRequest, 
  CancelarTransaccionRequest, 
  CalcularConversionRequest,
  VerificarDisponibilidadRequest,
  ConsultarTransaccionesRequest
} from '../Models/Transaccion/TransaccionRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class TransaccionController {
  private transaccionService: TransaccionService;

  constructor() {
    this.transaccionService = new TransaccionService();
  }

  /**
   * Procesa una transacción de cambio de moneda
   */
  procesarCambio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new ProcesarCambioRequest(), req.body);
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

      const transaccion = await this.transaccionService.procesarCambio(request);

      res.status(201).json({
        success: true,
        message: 'Transacción procesada exitosamente',
        data: transaccion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Calcula una conversión sin procesarla
   */
  calcularConversion = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CalcularConversionRequest(), req.body);
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

      const resultado = await this.transaccionService.calcularConversion(
        request.montoOrigen,
        request.monedaOrigenId,
        request.monedaDestinoId,
        request.casaDeCambioId
      );

      res.status(200).json({
        message: 'Conversión calculada exitosamente',
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Verifica disponibilidad de fondos en una ventanilla
   */
  verificarDisponibilidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new VerificarDisponibilidadRequest(), req.body);
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

      const disponible = await this.transaccionService.verificarDisponibilidad(
        request.ventanillaId,
        request.monedaId,
        request.monto
      );

      res.status(200).json({
        message: 'Verificación completada',
        data: { disponible },
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene transacciones por ventanilla
   */
  getByVentanilla = async (req: Request, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.ventanillaId);
      const fecha = req.query.fecha ? new Date(req.query.fecha as string) : undefined;

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          message: 'ID de ventanilla inválido',
        });
        return;
      }

      const transacciones = await this.transaccionService.obtenerPorVentanilla(ventanillaId, fecha);

      res.status(200).json({
        message: 'Transacciones obtenidas exitosamente',
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
   * Obtiene transacciones por cliente
   */
  getByCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const clienteId = parseInt(req.params.clienteId);

      if (isNaN(clienteId)) {
        res.status(400).json({
          message: 'ID de cliente inválido',
        });
        return;
      }

      const transacciones = await this.transaccionService.obtenerPorCliente(clienteId);

      res.status(200).json({
        message: 'Transacciones obtenidas exitosamente',
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
   * Obtiene una transacción por número
   */
  getByNumero = async (req: Request, res: Response): Promise<void> => {
    try {
      const numeroTransaccion = req.params.numero;

      if (!numeroTransaccion) {
        res.status(400).json({
          message: 'Número de transacción requerido',
        });
        return;
      }

      const transaccion = await this.transaccionService.obtenerPorNumero(numeroTransaccion);

      if (!transaccion) {
        res.status(404).json({
          message: 'Transacción no encontrada',
        });
        return;
      }

      res.status(200).json({
        message: 'Transacción obtenida exitosamente',
        data: transaccion,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Cancela una transacción
   */
  cancelar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const transaccionId = parseInt(req.params.id);
      const request = Object.assign(new CancelarTransaccionRequest(), req.body);
      const errors = await validate(request);

      if (isNaN(transaccionId)) {
        res.status(400).json({
          message: 'ID de transacción inválido',
        });
        return;
      }

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

      const cancelada = await this.transaccionService.cancelar(transaccionId, request.motivo);

      if (cancelada) {
        res.status(200).json({
          message: 'Transacción cancelada exitosamente',
        });
      } else {
        res.status(400).json({
          message: 'No se pudo cancelar la transacción',
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Consulta transacciones con filtros
   */
  consultar = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new ConsultarTransaccionesRequest(), req.query);
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

      // Esta funcionalidad se implementará cuando se complete el servicio de reportes
      res.status(501).json({
        message: 'Funcionalidad en desarrollo - usar endpoints específicos por ventanilla o cliente',
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene todas las transacciones (con paginación y filtros para operaciones rápidas)
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const ordenar = req.query.ordenar as string || 'fecha_desc';
      const ventanillaId = req.query.ventanillaId ? parseInt(req.query.ventanillaId as string) : undefined;

      const transacciones = await this.transaccionService.obtenerTodas({
        limit,
        offset,
        ordenar,
        ventanillaId,
      });

      res.status(200).json({
        message: 'Transacciones obtenidas exitosamente',
        data: transacciones,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };
}