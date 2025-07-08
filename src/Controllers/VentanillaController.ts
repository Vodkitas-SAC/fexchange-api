import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { VentanillaService } from '../Services/Implementation/VentanillaService';
import { UsuarioService } from '../Services/Implementation/UsuarioService';
import { CreateVentanillaRequest, UpdateVentanillaRequest, AperturarVentanillaRequest } from '../Models/Ventanilla/VentanillaRequestParams';
import { CierreVentanillaRequest } from '../Models/Ventanilla/CierreVentanillaRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class VentanillaController {
  private ventanillaService: VentanillaService;
  private usuarioService: UsuarioService;

  constructor() {
    this.ventanillaService = new VentanillaService();
    this.usuarioService = new UsuarioService();
  }

  /**
   * Retrieves all ventanillas from the system
   */
  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const ventanillas = await this.ventanillaService.getAll();

      res.status(200).json({
        success: true,
        message: 'Ventanillas retrieved successfully',
        data: ventanillas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Creates a new ventanilla
   */
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateVentanillaRequest(), req.body);
      const errors = await validate(request);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const ventanilla = await this.ventanillaService.create(request);

      res.status(201).json({
        success: true,
        message: 'Ventanilla created successfully',
        data: ventanilla,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error creating ventanilla',
      });
    }
  };

  /**
   * Gets ventanillas by casa de cambio
   */
  getByCasaDeCambio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);

      if (isNaN(casaDeCambioId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid casa de cambio ID',
        });
        return;
      }

      const ventanillas = await this.ventanillaService.getByCasaDeCambio(casaDeCambioId);

      res.status(200).json({
        success: true,
        message: 'Ventanillas retrieved successfully',
        data: ventanillas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving ventanillas',
      });
    }
  };

  /**
   * Gets ventanillas by status
   */
  getByEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);
      const { estado } = req.params;

      if (isNaN(casaDeCambioId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid casa de cambio ID',
        });
        return;
      }

      const ventanillas = await this.ventanillaService.getByEstado(casaDeCambioId, estado);

      res.status(200).json({
        success: true,
        message: 'Ventanillas retrieved successfully',
        data: ventanillas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving ventanillas by status',
      });
    }
  };

  /**
   * Gets a ventanilla by ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ID',
        });
        return;
      }

      const ventanilla = await this.ventanillaService.getById(id);

      if (!ventanilla) {
        res.status(404).json({
          success: false,
          message: 'Ventanilla not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ventanilla retrieved successfully',
        data: ventanilla,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving ventanilla',
      });
    }
  };

  /**
   * Gets a ventanilla by identifier
   */
  getByIdentificador = async (req: Request, res: Response): Promise<void> => {
    try {
      const { identificador } = req.params;

      const ventanilla = await this.ventanillaService.getByIdentificador(identificador);

      if (!ventanilla) {
        res.status(404).json({
          success: false,
          message: 'Ventanilla not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ventanilla retrieved successfully',
        data: ventanilla,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving ventanilla',
      });
    }
  };

  /**
   * Updates a ventanilla
   */
  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ID',
        });
        return;
      }

      const request = Object.assign(new UpdateVentanillaRequest(), req.body);
      const errors = await validate(request);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const ventanilla = await this.ventanillaService.update(id, request);

      if (!ventanilla) {
        res.status(404).json({
          success: false,
          message: 'Ventanilla not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ventanilla updated successfully',
        data: ventanilla,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating ventanilla',
      });
    }
  };

  /**
   * Toggles ventanilla active status
   */
  toggleActive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ID',
        });
        return;
      }

      const ventanilla = await this.ventanillaService.toggleActive(id);

      if (!ventanilla) {
        res.status(404).json({
          success: false,
          message: 'Ventanilla not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Ventanilla ${ventanilla.activa ? 'activated' : 'deactivated'} successfully`,
        data: ventanilla,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error toggling ventanilla status',
      });
    }
  };

  /**
   * Opens a ventanilla
   */
  aperturar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ventanilla inválido',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      // Verificar si el usuario puede aperturar esta ventanilla
      const canAperturar = await this.usuarioService.canAperturarVentanilla(req.user.id, ventanillaId);
      
      if (!canAperturar.canAperturar) {
        res.status(400).json({
          success: false,
          message: canAperturar.reason || 'No puedes aperturar esta ventanilla',
        });
        return;
      }

      const request = plainToClass(AperturarVentanillaRequest, req.body);
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

      const apertura = await this.ventanillaService.aperturar(ventanillaId, request);

      res.status(200).json({
        success: true,
        message: 'Ventanilla aperturada exitosamente',
        data: apertura,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al aperturar ventanilla',
      });
    }
  };


  /**
   * Cierra una ventanilla
   */
  cerrar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ventanilla inválido',
        });
        return;
      }

      const request = Object.assign(new CierreVentanillaRequest(), req.body);
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

      const cierre = await this.ventanillaService.cerrar(ventanillaId, request);

      res.status(200).json({
        success: true,
        message: 'Ventanilla cerrada exitosamente',
        data: cierre,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al cerrar ventanilla',
      });
    }
  };

  /**
   * Pauses a ventanilla
   */
  pausar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ventanilla ID',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const ventanilla = await this.ventanillaService.pausar(ventanillaId, req.user.id);

      if (!ventanilla) {
        res.status(404).json({
          success: false,
          message: 'Ventanilla not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ventanilla paused successfully',
        data: ventanilla,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error pausing ventanilla',
      });
    }
  };

  /**
   * Resumes a paused ventanilla
   */
  reanudar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ventanilla ID',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const ventanilla = await this.ventanillaService.reanudar(ventanillaId, req.user.id);

      if (!ventanilla) {
        res.status(404).json({
          success: false,
          message: 'Ventanilla not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ventanilla resumed successfully',
        data: ventanilla,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error resuming ventanilla',
      });
    }
  };

  /**
   * Checks if a ventanilla can serve customers
   */
  puedeAtender = async (req: Request, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ventanilla ID',
        });
        return;
      }

      const puedeAtender = await this.ventanillaService.puedeAtender(ventanillaId);

      res.status(200).json({
        success: true,
        message: 'Verification completed',
        data: {
          puedeAtender,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking ventanilla availability',
      });
    }
  };

  /**
   * Gets ventanilla history
   */
  getHistorial = async (req: Request, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ventanilla ID',
        });
        return;
      }

      const { fechaInicio, fechaFin } = req.query;
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (fechaInicio && typeof fechaInicio === 'string') {
        startDate = new Date(fechaInicio);
      }

      if (fechaFin && typeof fechaFin === 'string') {
        endDate = new Date(fechaFin);
      }

      const historial = await this.ventanillaService.getHistorial(ventanillaId, startDate, endDate);

      res.status(200).json({
        success: true,
        message: 'History retrieved successfully',
        data: historial,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving ventanilla history',
      });
    }
  };

  /**
   * Gets the active opening of a ventanilla
   */
  getAperturaActiva = async (req: Request, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ventanilla ID',
        });
        return;
      }

      const apertura = await this.ventanillaService.getAperturaActiva(ventanillaId);

      if (!apertura) {
        res.status(404).json({
          success: false,
          message: 'No active opening found for this ventanilla',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Active opening retrieved successfully',
        data: apertura,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving active opening',
      });
    }
  };

  /**
   * Verifica permisos de operación para una ventanilla
   */
  verificarPermisosOperacion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ventanilla inválido',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const permisos = await this.ventanillaService.puedeOperarVentanilla(ventanillaId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Verificación de permisos completada',
        data: permisos,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al verificar permisos',
      });
    }
  };

  /**
   * Verifica tipos de cambio disponibles para aperturar ventanilla
   */
  verificarTiposCambio = async (req: Request, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ventanilla inválido',
        });
        return;
      }

      const resultado = await this.ventanillaService.obtenerTiposCambioParaVentanilla(ventanillaId);

      res.status(200).json({
        success: true,
        message: 'Verificación de tipos de cambio completada',
        data: resultado,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al verificar tipos de cambio',
      });
    }
  };

  /**
   * Verifies amount availability
   */
  verificarDisponibilidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const ventanillaId = parseInt(req.params.id);
      const { monedaId, monto } = req.query;

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ventanilla ID',
        });
        return;
      }

      if (!monedaId || !monto) {
        res.status(400).json({
          success: false,
          message: 'Parameters monedaId and monto are required',
        });
        return;
      }

      const disponible = await this.ventanillaService.verificarDisponibilidadMontos(
        ventanillaId, 
        parseInt(monedaId as string), 
        parseFloat(monto as string)
      );

      res.status(200).json({
        success: true,
        message: 'Availability verification completed',
        data: {
          disponible,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verifying amount availability',
      });
    }
  };

  /**
   * Deletes a ventanilla
   */
  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ID',
        });
        return;
      }

      const deleted = await this.ventanillaService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Ventanilla not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ventanilla deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error deleting ventanilla',
      });
    }
  };

  /**
   * Obtiene el resumen de cierre con montos esperados calculados automáticamente
   */
  getResumenCierre = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de ventanilla inválido',
        });
        return;
      }

      const resumen = await this.ventanillaService.getResumenCierre(id);

      res.status(200).json({
        success: true,
        message: 'Resumen de cierre obtenido exitosamente',
        data: resumen,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener resumen de cierre',
      });
    }
  };

  /**
   * Procesa el cierre de ventanilla con validación física de montos
   */
  procesarCierre = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de ventanilla inválido',
        });
        return;
      }

      const request = plainToClass(CierreVentanillaRequest, req.body);
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

      const resultado = await this.ventanillaService.procesarCierreVentanilla(
        id,
        req.user!.id,
        request
      );

      if (resultado) {
        res.status(200).json({
          success: true,
          message: 'Ventanilla cerrada exitosamente',
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'No se pudo cerrar la ventanilla',
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al cerrar ventanilla',
      });
    }
  };
}