import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { UsuarioService } from '../Services/Implementation/UsuarioService';
import { CreateUsuarioRequest, UpdateUsuarioRequest, LoginRequest } from '../Models/Usuario/UsuarioRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  /**
   * Autentica un usuario
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new LoginRequest(), req.body);
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

      const result = await this.usuarioService.login(request);

      if (!result) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          usuario: result.usuario,
          token: result.token,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en el servidor',
      });
    }
  };

  /**
   * Crea un nuevo usuario
   */
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateUsuarioRequest(), req.body);
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

      const usuario = await this.usuarioService.create(request);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear usuario',
      });
    }
  };

  /**
   * Obtiene usuarios por casa de cambio
   */
  getByCasaDeCambio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);

      if (isNaN(casaDeCambioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de casa de cambio inválido',
        });
        return;
      }

      const usuarios = await this.usuarioService.getByCasaDeCambio(casaDeCambioId);

      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: usuarios,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
      });
    }
  };

  /**
   * Obtiene un usuario por ID
   */
  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const usuario = await this.usuarioService.getById(id);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: usuario,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario',
      });
    }
  };

  /**
   * Actualiza un usuario
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

      const request = Object.assign(new UpdateUsuarioRequest(), req.body);
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

      const usuario = await this.usuarioService.update(id, request);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar usuario',
      });
    }
  };

  /**
   * Activa o desactiva un usuario
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

      const usuario = await this.usuarioService.toggleActive(id);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} exitosamente`,
        data: usuario,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado del usuario',
      });
    }
  };

  /**
   * Cambia la contraseña de un usuario
   */
  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { oldPassword, newPassword } = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas',
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres',
        });
        return;
      }

      const success = await this.usuarioService.changePassword(id, oldPassword, newPassword);

      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta o usuario no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
      });
    }
  };

  /**
   * Verifica los requisitos de administradores
   */
  verifyAdminRequirements = async (req: Request, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);

      if (isNaN(casaDeCambioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de casa de cambio inválido',
        });
        return;
      }

      const meetsRequirements = await this.usuarioService.verifyAdminRequirements(casaDeCambioId);

      res.status(200).json({
        success: true,
        message: 'Verificación de requisitos completada',
        data: {
          meetsRequirements,
          requirements: {
            adminMaestro: 1,
            admin: 1,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar requisitos de administradores',
      });
    }
  };

  /**
   * Verifica si un usuario tiene una ventanilla activa
   */
  hasVentanillaActiva = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const result = await this.usuarioService.hasVentanillaActiva(usuarioId);

      res.status(200).json({
        success: true,
        message: 'Verificación de ventanilla activa completada',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar ventanilla activa',
      });
    }
  };

  /**
   * Verifica si un usuario puede aperturar una ventanilla específica
   */
  canAperturarVentanilla = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.user?.id;
      const ventanillaId = parseInt(req.params.ventanillaId);

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      if (isNaN(ventanillaId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ventanilla inválido',
        });
        return;
      }

      const result = await this.usuarioService.canAperturarVentanilla(usuarioId, ventanillaId);

      res.status(200).json({
        success: true,
        message: 'Verificación de apertura de ventanilla completada',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar apertura de ventanilla',
      });
    }
  };

  /**
   * Obtiene la ventanilla activa del usuario autenticado
   */
  getVentanillaActiva = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const ventanillaActiva = await this.usuarioService.getVentanillaActiva(usuarioId);

      if (!ventanillaActiva) {
        res.status(404).json({
          success: false,
          message: 'No tienes ninguna ventanilla activa',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ventanilla activa obtenida exitosamente',
        data: ventanillaActiva,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener ventanilla activa',
      });
    }
  };

  /**
   * Verifica si el usuario puede ver información de ganancias
   */
  canViewGanancias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const canView = await this.usuarioService.canViewGanancias(usuarioId);

      res.status(200).json({
        success: true,
        message: 'Verificación de permisos de ganancias completada',
        data: {
          canViewGanancias: canView,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos de ganancias',
      });
    }
  };

  /**
   * Obtiene usuarios de ventanilla por casa de cambio
   */
  getUsuariosVentanilla = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const casaDeCambioId = parseInt(req.params.casaDeCambioId);

      if (isNaN(casaDeCambioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de casa de cambio inválido',
        });
        return;
      }

      const usuarios = await this.usuarioService.getUsuariosVentanillaByCasa(casaDeCambioId);

      res.status(200).json({
        success: true,
        message: 'Usuarios de ventanilla obtenidos exitosamente',
        data: usuarios,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios de ventanilla',
      });
    }
  };
}