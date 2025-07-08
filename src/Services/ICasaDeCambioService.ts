import { CasaDeCambio } from '../DbModel/Entities/CasaDeCambio';
import { CreateCasaDeCambioRequest, UpdateCasaDeCambioRequest } from '../Models/CasaDeCambio/CasaDeCambioRequestParams';
import { CasaDeCambioDto } from '../Models/CasaDeCambio/CasaDeCambioDto';

export interface ICasaDeCambioService {
  /**
   * Crea una nueva casa de cambio
   */
  create(request: CreateCasaDeCambioRequest): Promise<CasaDeCambioDto>;

  /**
   * Obtiene todas las casas de cambio
   */
  getAll(): Promise<CasaDeCambioDto[]>;

  /**
   * Obtiene una casa de cambio por ID
   */
  getById(id: number): Promise<CasaDeCambioDto | null>;

  /**
   * Obtiene una casa de cambio por identificador
   */
  getByIdentificador(identificador: string): Promise<CasaDeCambioDto | null>;

  /**
   * Actualiza una casa de cambio
   */
  update(id: number, request: UpdateCasaDeCambioRequest): Promise<CasaDeCambioDto | null>;

  /**
   * Elimina una casa de cambio
   */
  delete(id: number): Promise<boolean>;

  /**
   * Verifica si una casa de cambio tiene los requisitos mínimos
   */
  verifyMinimumRequirements(id: number): Promise<boolean>;
}