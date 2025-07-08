import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { MonedaService } from '../Services/Implementation/MonedaService';
import { CreateMonedaRequest, UpdateMonedaRequest } from '../Models/Moneda/MonedaRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class MonedaController {
  private monedaService: MonedaService;

  constructor() {
    this.monedaService = new MonedaService();
  }

  /**
   * Crea una nueva moneda
   */
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateMonedaRequest(), req.body);
      const errors = await validate(request);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const moneda = await this.monedaService.create(request);

      res.status(201).json({
        success: true,
        message: 'Moneda creada exitosamente',
        data: moneda,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear moneda',
      });
    }
  };

  /**
   * Obtiene todas las monedas
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      // Por defecto solo monedas activas, incluir inactivas si se especifica
      const includeInactive = req.query.includeInactive === 'true';
      const monedas = await this.monedaService.getAll(includeInactive);

      res.status(200).json({
        success: true,
        message: 'Monedas obtenidas exitosamente',
        data: monedas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener monedas',
      });
    }
  };

  /**
   * Obtiene solo las monedas activas
   */
  getActive = async (req: Request, res: Response): Promise<void> => {
    try {
      const monedas = await this.monedaService.getActive();

      res.status(200).json({
        success: true,
        message: 'Monedas activas obtenidas exitosamente',
        data: monedas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener monedas activas',
      });
    }
  };

  /**
   * Obtiene una moneda por ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const moneda = await this.monedaService.getById(id);

      if (!moneda) {
        res.status(404).json({
          success: false,
          message: 'Moneda no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Moneda obtenida exitosamente',
        data: moneda,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener moneda',
      });
    }
  };

  /**
   * Obtiene una moneda por código
   */
  getByCodigo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo } = req.params;

      const moneda = await this.monedaService.getByCodigo(codigo);

      if (!moneda) {
        res.status(404).json({
          success: false,
        message: 'Moneda no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Moneda obtenida exitosamente',
        data: moneda,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener moneda',
      });
    }
  };

  /**
   * Busca monedas por término
   */
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
        message: 'Parámetro de búsqueda requerido',
        });
        return;
      }

      const monedas = await this.monedaService.search(q);

      res.status(200).json({
        success: true,
        message: 'Búsqueda completada exitosamente',
        data: monedas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar monedas',
      });
    }
  };

  /**
   * Actualiza una moneda
   */
  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
        message: 'ID inválido',
        });
        return;
      }

      const request = Object.assign(new UpdateMonedaRequest(), req.body);
      const errors = await validate(request);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
        message: 'Datos de entrada inválidos',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const moneda = await this.monedaService.update(id, request);

      if (!moneda) {
        res.status(404).json({
          success: false,
        message: 'Moneda no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Moneda actualizada exitosamente',
        data: moneda,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar moneda',
      });
    }
  };

  /**
   * Activa o desactiva una moneda
   */
  toggleActive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
        message: 'ID inválido',
        });
        return;
      }

      const moneda = await this.monedaService.toggleActive(id);

      if (!moneda) {
        res.status(404).json({
          success: false,
        message: 'Moneda no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Moneda ${moneda.activa ? 'activada' : 'desactivada'} exitosamente`,
        data: moneda,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al cambiar estado de la moneda',
      });
    }
  };

  /**
   * Elimina una moneda
   */
  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
        message: 'ID inválido',
        });
        return;
      }

      const deleted = await this.monedaService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
        message: 'Moneda no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Moneda eliminada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar moneda',
      });
    }
  };

  /**
   * Verifica si una moneda puede ser eliminada
   */
  canBeDeleted = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
        message: 'ID inválido',
        });
        return;
      }

      const canDelete = await this.monedaService.canBeDeleted(id);

      res.status(200).json({
        success: true,
        message: 'Verificación completada',
        data: {
          canBeDeleted: canDelete,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar si la moneda puede ser eliminada',
      });
    }
  };
}