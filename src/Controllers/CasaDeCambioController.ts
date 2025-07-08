import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { CasaDeCambioService } from '../Services/Implementation/CasaDeCambioService';
import { CreateCasaDeCambioRequest, UpdateCasaDeCambioRequest } from '../Models/CasaDeCambio/CasaDeCambioRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class CasaDeCambioController {
  private casaDeCambioService: CasaDeCambioService;

  constructor() {
    this.casaDeCambioService = new CasaDeCambioService();
  }

  /**
   * Crea una nueva casa de cambio
   */
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateCasaDeCambioRequest(), req.body);
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

      const casaDeCambio = await this.casaDeCambioService.create(request);

      res.status(201).json({
        success: true,
        message: 'Casa de cambio creada exitosamente',
        data: casaDeCambio,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear casa de cambio',
      });
    }
  };

  /**
   * Obtiene todas las casas de cambio
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const casas = await this.casaDeCambioService.getAll();

      res.status(200).json({
        success: true,
        message: 'Casas de cambio obtenidas exitosamente',
        data: casas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener casas de cambio',
      });
    }
  };

  /**
   * Obtiene una casa de cambio por ID
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

      const casa = await this.casaDeCambioService.getById(id);

      if (!casa) {
        res.status(404).json({
          success: false,
          message: 'Casa de cambio no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Casa de cambio obtenida exitosamente',
        data: casa,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener casa de cambio',
      });
    }
  };

  /**
   * Obtiene una casa de cambio por identificador
   */
  getByIdentificador = async (req: Request, res: Response): Promise<void> => {
    try {
      const { identificador } = req.params;

      const casa = await this.casaDeCambioService.getByIdentificador(identificador);

      if (!casa) {
        res.status(404).json({
          success: false,
          message: 'Casa de cambio no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Casa de cambio obtenida exitosamente',
        data: casa,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener casa de cambio',
      });
    }
  };

  /**
   * Actualiza una casa de cambio
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

      const request = Object.assign(new UpdateCasaDeCambioRequest(), req.body);
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

      const casa = await this.casaDeCambioService.update(id, request);

      if (!casa) {
        res.status(404).json({
          success: false,
          message: 'Casa de cambio no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Casa de cambio actualizada exitosamente',
        data: casa,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar casa de cambio',
      });
    }
  };

  /**
   * Elimina una casa de cambio
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

      const deleted = await this.casaDeCambioService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Casa de cambio no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Casa de cambio eliminada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar casa de cambio',
      });
    }
  };

  /**
   * Verifica los requisitos mínimos de una casa de cambio
   */
  verifyRequirements = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const meetsRequirements = await this.casaDeCambioService.verifyMinimumRequirements(id);

      res.status(200).json({
        success: true,
        message: 'Verificación de requisitos completada',
        data: {
          meetsRequirements,
          requirements: {
            minimumWindows: 1,
            minimumUsers: 1,
            minimumCurrencies: 2,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar requisitos',
      });
    }
  };

  /**
   * Activa o desactiva una casa de cambio
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

      const casa = await this.casaDeCambioService.getById(id);

      if (!casa) {
        res.status(404).json({
          success: false,
          message: 'Casa de cambio no encontrada',
        });
        return;
      }

      const updatedCasa = await this.casaDeCambioService.update(id, { activa: !casa.activa });

      res.status(200).json({
        success: true,
        message: `Casa de cambio ${updatedCasa?.activa ? 'activada' : 'desactivada'} exitosamente`,
        data: updatedCasa,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado de la casa de cambio',
      });
    }
  };
}