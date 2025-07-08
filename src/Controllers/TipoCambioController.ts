import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { TipoCambioService } from '../Services/Implementation/TipoCambioService';
import { 
  CreateTipoCambioRequest, 
  UpdateTipoCambioRequest, 
  ConsultarTipoCambioRequest
} from '../Models/TipoCambio/TipoCambioRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class TipoCambioController {
  private tipoCambioService: TipoCambioService;

  constructor() {
    this.tipoCambioService = new TipoCambioService();
  }

  /**
   * Crea un nuevo tipo de cambio
   */
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateTipoCambioRequest(), req.body);
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

      const tipoCambio = await this.tipoCambioService.create(request);

      res.status(201).json({
        message: 'Tipo de cambio creado exitosamente',
        data: tipoCambio,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene un tipo de cambio por ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de tipo de cambio inválido',
        });
        return;
      }

      const tipoCambio = await this.tipoCambioService.getById(id);

      if (!tipoCambio) {
        res.status(404).json({
          message: 'Tipo de cambio no encontrado',
        });
        return;
      }

      res.status(200).json({
        message: 'Tipo de cambio obtenido exitosamente',
        data: tipoCambio,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene todos los tipos de cambio activos
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const tiposCambio = await this.tipoCambioService.getAll();

      res.status(200).json({
        message: 'Tipos de cambio obtenidos exitosamente',
        data: tiposCambio,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene tipos de cambio por casa de cambio
   */
  getByCasaDeCambio = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);

      if (isNaN(casaDeCambioId)) {
        res.status(400).json({
          message: 'ID de casa de cambio inválido',
        });
        return;
      }

      const tiposCambio = await this.tipoCambioService.getByCasaDeCambio(casaDeCambioId);

      res.status(200).json({
        message: 'Tipos de cambio obtenidos exitosamente',
        data: tiposCambio,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene tipos de cambio activos por casa de cambio para operaciones rápidas
   */
  getActivosPorCasa = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);

      if (isNaN(casaDeCambioId)) {
        res.status(400).json({
          message: 'ID de casa de cambio inválido',
        });
        return;
      }

      const tiposCambio = await this.tipoCambioService.getActivosPorCasa(casaDeCambioId);

      res.status(200).json({
        message: 'Tipos de cambio activos obtenidos exitosamente',
        data: tiposCambio,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene el tipo de cambio vigente para una conversión específica
   */
  getTipoCambioVigente = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new ConsultarTipoCambioRequest(), req.body);
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

      const tipoCambio = await this.tipoCambioService.getTipoCambioVigente(request);

      if (!tipoCambio) {
        res.status(404).json({
          message: 'No se encontró tipo de cambio vigente para la conversión solicitada',
        });
        return;
      }

      res.status(200).json({
        message: 'Tipo de cambio vigente obtenido exitosamente',
        data: tipoCambio,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene el historial de tipos de cambio
   */
  getHistorial = async (req: Request, res: Response): Promise<void> => {
    try {
      const monedaOrigenId = parseInt(req.params.monedaOrigenId);
      const monedaDestinoId = parseInt(req.params.monedaDestinoId);
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);
      const fechaInicio = req.query.fechaInicio ? new Date(req.query.fechaInicio as string) : undefined;
      const fechaFin = req.query.fechaFin ? new Date(req.query.fechaFin as string) : undefined;

      if (isNaN(monedaOrigenId) || isNaN(monedaDestinoId) || isNaN(casaDeCambioId)) {
        res.status(400).json({
          message: 'Parámetros inválidos',
        });
        return;
      }

      const historial = await this.tipoCambioService.getHistorial(
        monedaOrigenId,
        monedaDestinoId,
        casaDeCambioId,
        fechaInicio,
        fechaFin
      );

      res.status(200).json({
        message: 'Historial obtenido exitosamente',
        data: historial,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Actualiza un tipo de cambio
   */
  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const request = Object.assign(new UpdateTipoCambioRequest(), req.body);
      const errors = await validate(request);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de tipo de cambio inválido',
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

      const tipoCambioActualizado = await this.tipoCambioService.update(id, request);

      res.status(200).json({
        message: 'Tipo de cambio actualizado exitosamente',
        data: tipoCambioActualizado,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Desactiva un tipo de cambio
   */
  desactivar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de tipo de cambio inválido',
        });
        return;
      }

      const desactivado = await this.tipoCambioService.desactivar(id);

      if (desactivado) {
        res.status(200).json({
          message: 'Tipo de cambio desactivado exitosamente',
        });
      } else {
        res.status(400).json({
          message: 'No se pudo desactivar el tipo de cambio',
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
   * Activa un tipo de cambio
   */
  activar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de tipo de cambio inválido',
        });
        return;
      }

      const activado = await this.tipoCambioService.activar(id);

      if (activado) {
        res.status(200).json({
          message: 'Tipo de cambio activado exitosamente',
        });
      } else {
        res.status(400).json({
          message: 'No se pudo activar el tipo de cambio',
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
   * Elimina un tipo de cambio
   */
  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de tipo de cambio inválido',
        });
        return;
      }

      const eliminado = await this.tipoCambioService.delete(id);

      if (eliminado) {
        res.status(200).json({
          message: 'Tipo de cambio eliminado exitosamente',
        });
      } else {
        res.status(400).json({
          message: 'No se pudo eliminar el tipo de cambio',
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
   * Verifica si un tipo de cambio está disponible
   */
  verificarDisponibilidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const monedaOrigenId = parseInt(req.query.monedaOrigenId as string);
      const monedaDestinoId = parseInt(req.query.monedaDestinoId as string);
      const casaDeCambioId = parseInt(req.query.casaDeCambioId as string);
      const fecha = req.query.fecha ? new Date(req.query.fecha as string) : undefined;

      if (isNaN(monedaOrigenId) || isNaN(monedaDestinoId) || isNaN(casaDeCambioId)) {
        res.status(400).json({
          message: 'Parámetros requeridos: monedaOrigenId, monedaDestinoId, casaDeCambioId',
        });
        return;
      }

      const disponible = await this.tipoCambioService.isDisponible(
        monedaOrigenId,
        monedaDestinoId,
        casaDeCambioId,
        fecha
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
   * Obtiene todos los pares de monedas disponibles para una casa de cambio
   */
  getParesDisponibles = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);

      if (isNaN(casaDeCambioId)) {
        res.status(400).json({
          message: 'ID de casa de cambio inválido',
        });
        return;
      }

      const pares = await this.tipoCambioService.getParesDisponibles(casaDeCambioId);

      res.status(200).json({
        message: 'Pares de monedas obtenidos exitosamente',
        data: pares,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene los tipos de cambio actuales para el dashboard
   */
  getTiposCambioActuales = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = req.query.casaDeCambioId ? parseInt(req.query.casaDeCambioId as string) : undefined;

      const tiposCambio = await this.tipoCambioService.getTiposCambioActuales(casaDeCambioId);

      res.status(200).json({
        message: 'Tipos de cambio actuales obtenidos exitosamente',
        data: tiposCambio,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };
}