import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { PersonaService } from '../Services/Implementation/PersonaService';
import { CreatePersonaRequest, UpdatePersonaRequest } from '../Models/Persona/PersonaRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class PersonaController {
  private personaService: PersonaService;

  constructor() {
    this.personaService = new PersonaService();
  }

  /**
   * Creates a new persona
   */
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreatePersonaRequest(), req.body);
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

      const persona = await this.personaService.create(request);

      res.status(201).json({
        success: true,
        message: 'Persona creada exitosamente',
        data: persona,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear persona',
      });
    }
  };

  /**
   * Retrieves all personas
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const personas = await this.personaService.getAll();

      res.status(200).json({
        success: true,
        message: 'Personas obtenidas exitosamente',
        data: personas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener personas',
      });
    }
  };

  /**
   * Retrieves a persona by ID
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

      const persona = await this.personaService.getById(id);

      if (!persona) {
        res.status(404).json({
          success: false,
          message: 'Persona no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Persona obtenida exitosamente',
        data: persona,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener persona',
      });
    }
  };

  /**
   * Retrieves persona by document number
   */
  getByNumeroDocumento = async (req: Request, res: Response): Promise<void> => {
    try {
      const { numeroDocumento } = req.params;

      const persona = await this.personaService.getByNumeroDocumento(numeroDocumento);

      if (!persona) {
        res.status(404).json({
          success: false,
          message: 'Persona no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Persona obtenida exitosamente',
        data: persona,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener persona',
      });
    }
  };

  /**
   * Searches personas by name
   */
  searchByName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Parámetro de búsqueda requerido',
        });
        return;
      }

      const personas = await this.personaService.searchByName(q);

      res.status(200).json({
        success: true,
        message: 'Búsqueda completada exitosamente',
        data: personas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar personas',
      });
    }
  };

  /**
   * Updates a persona
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

      const request = Object.assign(new UpdatePersonaRequest(), req.body);
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

      const persona = await this.personaService.update(id, request);

      if (!persona) {
        res.status(404).json({
          success: false,
          message: 'Persona no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Persona actualizada exitosamente',
        data: persona,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar persona',
      });
    }
  };

  /**
   * Deletes a persona
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

      const deleted = await this.personaService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Persona no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Persona eliminada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar persona',
      });
    }
  };

  /**
   * Verifies if persona can be deleted
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

      const canDelete = await this.personaService.canBeDeleted(id);

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
        message: 'Error al verificar si la persona puede ser eliminada',
      });
    }
  };
}