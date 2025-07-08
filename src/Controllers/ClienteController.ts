import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { ClienteService } from '../Services/Implementation/ClienteService';
import { 
  CreateClienteRequest, 
  UpdateClienteRequest, 
  CreateClienteRegistradoRequest,
  CreateClienteOcasionalRequest,
  CreateClienteEmpresarialRequest
} from '../Models/Cliente/ClienteRequestParams';
import { AuthenticatedRequest } from '../Helpers/JwtHelper';

export class ClienteController {
  private clienteService: ClienteService;

  constructor() {
    this.clienteService = new ClienteService();
  }

  /**
   * Crea un nuevo cliente (general)
   */
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateClienteRequest(), req.body);
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

      const cliente = await this.clienteService.create(request);

      res.status(201).json({
        message: 'Cliente creado exitosamente',
        data: cliente,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Crea un cliente registrado con una persona existente
   */
  createRegistrado = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateClienteRegistradoRequest(), req.body);
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

      const cliente = await this.clienteService.createRegistrado(request);

      res.status(201).json({
        message: 'Cliente registrado creado exitosamente',
        data: cliente,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Crea un cliente ocasional (sin datos completos)
   */
  createOcasional = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateClienteOcasionalRequest(), req.body);
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

      const cliente = await this.clienteService.createOcasional(request);

      res.status(201).json({
        message: 'Cliente ocasional creado exitosamente',
        data: cliente,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Crea un cliente empresarial con representante legal
   */
  createEmpresarial = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = Object.assign(new CreateClienteEmpresarialRequest(), req.body);
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

      const cliente = await this.clienteService.createEmpresarial(request);

      res.status(201).json({
        message: 'Cliente empresarial creado exitosamente',
        data: cliente,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene un cliente por ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de cliente inválido',
        });
        return;
      }

      const cliente = await this.clienteService.getById(id);

      if (!cliente) {
        res.status(404).json({
          message: 'Cliente no encontrado',
        });
        return;
      }

      res.status(200).json({
        message: 'Cliente obtenido exitosamente',
        data: cliente,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene todos los clientes
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientes = await this.clienteService.getAll();

      res.status(200).json({
        message: 'Clientes obtenidos exitosamente',
        data: clientes,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Busca un cliente por número de documento
   */
  getByDocumento = async (req: Request, res: Response): Promise<void> => {
    try {
      const numeroDocumento = req.params.documento;

      if (!numeroDocumento) {
        res.status(400).json({
          message: 'Número de documento requerido',
        });
        return;
      }

      const cliente = await this.clienteService.getByDocumento(numeroDocumento);

      if (!cliente) {
        res.status(404).json({
          message: 'Cliente no encontrado con ese número de documento',
        });
        return;
      }

      res.status(200).json({
        message: 'Cliente obtenido exitosamente',
        data: cliente,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Actualiza un cliente
   */
  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const request = Object.assign(new UpdateClienteRequest(), req.body);
      const errors = await validate(request);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de cliente inválido',
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

      const clienteActualizado = await this.clienteService.update(id, request);

      res.status(200).json({
        message: 'Cliente actualizado exitosamente',
        data: clienteActualizado,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Elimina un cliente
   */
  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de cliente inválido',
        });
        return;
      }

      const eliminado = await this.clienteService.delete(id);

      if (eliminado) {
        res.status(200).json({
          message: 'Cliente eliminado exitosamente',
        });
      } else {
        res.status(400).json({
          message: 'No se pudo eliminar el cliente',
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
   * Busca clientes por criterios
   */
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const filtros = {
        tipo: req.query.tipo as string,
        ruc: req.query.ruc as string,
        nombres: req.query.nombres as string,
        apellidoPaterno: req.query.apellidoPaterno as string,
        apellidoMaterno: req.query.apellidoMaterno as string,
        numeroDocumento: req.query.numeroDocumento as string,
        razonSocial: req.query.razonSocial as string,
        esActivo: req.query.esActivo === 'true' ? true : req.query.esActivo === 'false' ? false : undefined,
        profesion: req.query.profesion as string,
      };

      // Remover filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] === undefined) {
          delete filtros[key as keyof typeof filtros];
        }
      });

      const clientes = await this.clienteService.search(filtros);

      res.status(200).json({
        message: 'Búsqueda completada exitosamente',
        data: clientes,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Activa o desactiva un cliente
   */
  toggleEstado = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de cliente inválido',
        });
        return;
      }

      const cliente = await this.clienteService.toggleEstado(id);

      res.status(200).json({
        message: `Cliente ${cliente.es_activo ? 'activado' : 'desactivado'} exitosamente`,
        data: cliente,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Valida datos de cliente según su tipo
   */
  validarDatos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tipo, datos } = req.body;

      if (!tipo || !datos) {
        res.status(400).json({
          message: 'Tipo y datos son requeridos',
        });
        return;
      }

      const resultado = await this.clienteService.validarDatosSegunTipo(tipo, datos);

      res.status(200).json({
        message: 'Validación completada',
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
   * Obtiene clientes por tipo específico
   */
  getByTipo = async (req: Request, res: Response): Promise<void> => {
    try {
      const tipo = req.params.tipo;

      if (!tipo) {
        res.status(400).json({
          message: 'Tipo de cliente requerido',
        });
        return;
      }

      const clientes = await this.clienteService.getByTipo(tipo);

      res.status(200).json({
        message: `Clientes de tipo '${tipo}' obtenidos exitosamente`,
        data: clientes,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Verifica si un RUC ya existe
   */
  existeRuc = async (req: Request, res: Response): Promise<void> => {
    try {
      const ruc = req.params.ruc;
      const excludeId = req.query.excludeId ? parseInt(req.query.excludeId as string) : undefined;

      if (!ruc) {
        res.status(400).json({
          message: 'RUC requerido',
        });
        return;
      }

      const existe = await this.clienteService.existeRuc(ruc, excludeId);

      res.status(200).json({
        message: 'Verificación de RUC completada',
        data: { existe },
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  /**
   * Obtiene el historial de transacciones de un cliente
   */
  getHistorial = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          message: 'ID de cliente inválido',
        });
        return;
      }

      const historial = await this.clienteService.getHistorialTransacciones(id);

      res.status(200).json({
        message: 'Historial de transacciones obtenido exitosamente',
        data: historial,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };
}