import { CreateMonedaRequest, UpdateMonedaRequest } from '../Models/Moneda/MonedaRequestParams';
import { MonedaDto } from '../Models/Moneda/MonedaDto';

export interface IMonedaService {
  /**
   * Crea una nueva moneda
   */
  create(request: CreateMonedaRequest): Promise<MonedaDto>;

  /**
   * Obtiene todas las monedas
   */
  getAll(includeInactive?: boolean): Promise<MonedaDto[]>;

  /**
   * Obtiene monedas activas únicamente
   */
  getActive(): Promise<MonedaDto[]>;

  /**
   * Obtiene una moneda por ID
   */
  getById(id: number): Promise<MonedaDto | null>;

  /**
   * Obtiene una moneda por código
   */
  getByCodigo(codigo: string): Promise<MonedaDto | null>;

  /**
   * Actualiza una moneda
   */
  update(id: number, request: UpdateMonedaRequest): Promise<MonedaDto | null>;

  /**
   * Activa o desactiva una moneda
   */
  toggleActive(id: number): Promise<MonedaDto | null>;

  /**
   * Elimina una moneda (solo si no está en uso)
   */
  delete(id: number): Promise<boolean>;

  /**
   * Verifica si una moneda puede ser eliminada
   */
  canBeDeleted(id: number): Promise<boolean>;

  /**
   * Busca monedas por nombre o código
   */
  search(searchTerm: string): Promise<MonedaDto[]>;
}