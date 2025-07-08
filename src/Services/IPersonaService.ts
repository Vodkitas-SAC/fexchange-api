import { CreatePersonaRequest, UpdatePersonaRequest } from '../Models/Persona/PersonaRequestParams';
import { PersonaDto } from '../Models/Persona/PersonaDto';

export interface IPersonaService {
  /**
   * Crea una nueva persona
   */
  create(request: CreatePersonaRequest): Promise<PersonaDto>;

  /**
   * Obtiene todas las personas
   */
  getAll(): Promise<PersonaDto[]>;

  /**
   * Obtiene una persona por ID
   */
  getById(id: number): Promise<PersonaDto | null>;

  /**
   * Obtiene una persona por número de documento
   */
  getByNumeroDocumento(numeroDocumento: string): Promise<PersonaDto | null>;

  /**
   * Actualiza una persona
   */
  update(id: number, request: UpdatePersonaRequest): Promise<PersonaDto | null>;

  /**
   * Elimina una persona
   */
  delete(id: number): Promise<boolean>;

  /**
   * Busca personas por nombre
   */
  searchByName(searchTerm: string): Promise<PersonaDto[]>;

  /**
   * Verifica si una persona puede ser eliminada (no tiene usuarios o clientes asociados)
   */
  canBeDeleted(id: number): Promise<boolean>;
}