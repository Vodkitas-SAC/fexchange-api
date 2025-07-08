import { Repository, Like } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { Persona } from '../../DbModel/Entities/Persona';
import { Usuario } from '../../DbModel/Entities/Usuario';
import { Cliente } from '../../DbModel/Entities/Cliente';
import { IPersonaService } from '../IPersonaService';
import { CreatePersonaRequest, UpdatePersonaRequest } from '../../Models/Persona/PersonaRequestParams';
import { PersonaDto } from '../../Models/Persona/PersonaDto';

export class PersonaService implements IPersonaService {
  private personaRepository: Repository<Persona>;
  private usuarioRepository: Repository<Usuario>;
  private clienteRepository: Repository<Cliente>;

  constructor() {
    this.personaRepository = AppDataSource.getRepository(Persona);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.clienteRepository = AppDataSource.getRepository(Cliente);
  }

  /**
   * Creates a new persona with validation
   */
  async create(request: CreatePersonaRequest): Promise<PersonaDto> {
    const existingPersona = await this.personaRepository.findOne({
      where: { numero_documento: request.numero_documento },
    });

    if (existingPersona) {
      throw new Error('Ya existe una persona con ese número de documento');
    }

    const persona = this.personaRepository.create(request);
    const savedPersona = await this.personaRepository.save(persona);

    return this.entityToDto(savedPersona);
  }

  /**
   * Retrieves all personas ordered by name
   */
  async getAll(): Promise<PersonaDto[]> {
    const personas = await this.personaRepository.find({
      order: { apellido_paterno: 'ASC', apellido_materno: 'ASC', nombres: 'ASC' },
    });

    return personas.map(persona => this.entityToDto(persona));
  }

  async getById(id: number): Promise<PersonaDto | null> {
    const persona = await this.personaRepository.findOne({
      where: { id },
    });

    return persona ? this.entityToDto(persona) : null;
  }

  async getByNumeroDocumento(numeroDocumento: string): Promise<PersonaDto | null> {
    const persona = await this.personaRepository.findOne({
      where: { numero_documento: numeroDocumento },
    });

    return persona ? this.entityToDto(persona) : null;
  }

  /**
   * Updates a persona with validation
   */
  async update(id: number, request: UpdatePersonaRequest): Promise<PersonaDto | null> {
    const persona = await this.personaRepository.findOne({ where: { id } });

    if (!persona) {
      return null;
    }

    if (request.numero_documento && request.numero_documento !== persona.numero_documento) {
      const existingPersona = await this.personaRepository.findOne({
        where: { numero_documento: request.numero_documento },
      });

      if (existingPersona) {
        throw new Error('Ya existe una persona con ese número de documento');
      }
    }

    Object.assign(persona, request);
    const updatedPersona = await this.personaRepository.save(persona);

    return this.entityToDto(updatedPersona);
  }

  /**
   * Deletes a persona after validation
   */
  async delete(id: number): Promise<boolean> {
    const canDelete = await this.canBeDeleted(id);
    
    if (!canDelete) {
      throw new Error('No se puede eliminar la persona porque tiene usuarios o clientes asociados');
    }

    const result = await this.personaRepository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }

  /**
   * Searches personas by name with partial matching
   */
  async searchByName(searchTerm: string): Promise<PersonaDto[]> {
    const personas = await this.personaRepository.find({
      where: [
        { nombres: Like(`%${searchTerm}%`) },
        { apellido_paterno: Like(`%${searchTerm}%`) },
        { apellido_materno: Like(`%${searchTerm}%`) },
      ],
      order: { apellido_paterno: 'ASC', apellido_materno: 'ASC', nombres: 'ASC' },
    });

    return personas.map(persona => this.entityToDto(persona));
  }

  async canBeDeleted(id: number): Promise<boolean> {
    // Verificar que no tenga usuarios asociados
    const usuariosCount = await this.usuarioRepository.count({
      where: { persona_id: id },
    });

    // Verificar que no tenga clientes asociados
    const clientesCount = await this.clienteRepository.count({
      where: { persona_id: id },
    });

    return usuariosCount === 0 && clientesCount === 0;
  }

  private entityToDto(entity: Persona): PersonaDto {
    return {
      id: entity.id,
      nombres: entity.nombres,
      apellido_paterno: entity.apellido_paterno,
      apellido_materno: entity.apellido_materno,
      fecha_nacimiento: entity.fecha_nacimiento,
      numero_telefono: entity.numero_telefono,
      direccion: entity.direccion,
      tipo_documento: entity.tipo_documento,
      numero_documento: entity.numero_documento,
      nacionalidad: entity.nacionalidad,
      ocupacion: entity.ocupacion,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}