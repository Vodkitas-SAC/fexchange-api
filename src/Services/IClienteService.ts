import { CreateClienteRequest, UpdateClienteRequest, CreateClienteRegistradoRequest, CreateClienteOcasionalRequest, CreateClienteEmpresarialRequest } from '../Models/Cliente/ClienteRequestParams';
import { ClienteDto } from '../Models/Cliente/ClienteDto';

export interface IClienteService {
  /**
   * Crea un nuevo cliente
   */
  create(request: CreateClienteRequest): Promise<ClienteDto>;

  /**
   * Crea un cliente registrado con una persona existente
   */
  createRegistrado(request: CreateClienteRegistradoRequest): Promise<ClienteDto>;

  /**
   * Crea un cliente ocasional (sin datos completos)
   */
  createOcasional(request: CreateClienteOcasionalRequest): Promise<ClienteDto>;

  /**
   * Crea un cliente empresarial con representante legal
   */
  createEmpresarial(request: CreateClienteEmpresarialRequest): Promise<ClienteDto>;

  /**
   * Obtiene un cliente por ID
   */
  getById(id: number): Promise<ClienteDto | null>;

  /**
   * Obtiene todos los clientes
   */
  getAll(): Promise<ClienteDto[]>;

  /**
   * Busca clientes por número de documento
   */
  getByDocumento(numeroDocumento: string): Promise<ClienteDto | null>;

  /**
   * Actualiza un cliente
   */
  update(id: number, request: UpdateClienteRequest): Promise<ClienteDto>;

  /**
   * Elimina un cliente (soft delete)
   */
  delete(id: number): Promise<boolean>;

  /**
   * Busca clientes por criterios avanzados
   */
  search(
    filtros: {
      tipo?: string;
      ruc?: string;
      nombres?: string;
      apellidoPaterno?: string;
      apellidoMaterno?: string;
      numeroDocumento?: string;
      razonSocial?: string;
      esActivo?: boolean;
      profesion?: string;
    }
  ): Promise<ClienteDto[]>;

  /**
   * Activa o desactiva un cliente
   */
  toggleEstado(id: number): Promise<ClienteDto>;

  /**
   * Valida datos de cliente según su tipo
   */
  validarDatosSegunTipo(tipo: string, datos: any): Promise<{ valido: boolean; errores: string[] }>;

  /**
   * Obtiene clientes por tipo específico
   */
  getByTipo(tipo: string): Promise<ClienteDto[]>;

  /**
   * Verifica si un RUC ya existe en el sistema
   */
  existeRuc(ruc: string, excludeId?: number): Promise<boolean>;

  /**
   * Obtiene el historial de transacciones de un cliente
   */
  getHistorialTransacciones(clienteId: number): Promise<any[]>;
}