import { Repository } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { CasaDeCambio } from '../../DbModel/Entities/CasaDeCambio';
import { Ventanilla } from '../../DbModel/Entities/Ventanilla';
import { Usuario } from '../../DbModel/Entities/Usuario';
import { Moneda } from '../../DbModel/Entities/Moneda';
import { ICasaDeCambioService } from '../ICasaDeCambioService';
import { CreateCasaDeCambioRequest, UpdateCasaDeCambioRequest } from '../../Models/CasaDeCambio/CasaDeCambioRequestParams';
import { CasaDeCambioDto } from '../../Models/CasaDeCambio/CasaDeCambioDto';

export class CasaDeCambioService implements ICasaDeCambioService {
  private casaDeCambioRepository: Repository<CasaDeCambio>;
  private ventanillaRepository: Repository<Ventanilla>;
  private usuarioRepository: Repository<Usuario>;
  private monedaRepository: Repository<Moneda>;

  constructor() {
    this.casaDeCambioRepository = AppDataSource.getRepository(CasaDeCambio);
    this.ventanillaRepository = AppDataSource.getRepository(Ventanilla);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.monedaRepository = AppDataSource.getRepository(Moneda);
  }

  /**
   * Crea una nueva casa de cambio con validación
   */
  async create(request: CreateCasaDeCambioRequest): Promise<CasaDeCambioDto> {
    const monedaMaestra = await this.monedaRepository.findOne({
      where: { id: request.moneda_maestra_id, activa: true },
    });

    if (!monedaMaestra) {
      throw new Error('La moneda maestra especificada no existe o no está activa');
    }

    const existingCasa = await this.casaDeCambioRepository.findOne({
      where: { identificador: request.identificador },
    });

    if (existingCasa) {
      throw new Error('Ya existe una casa de cambio con ese identificador');
    }

    const casaDeCambio = this.casaDeCambioRepository.create(request);
    const savedCasa = await this.casaDeCambioRepository.save(casaDeCambio);

    return this.entityToDto(savedCasa);
  }

  /**
   * Obtiene todas las casas de cambio con datos relacionados
   */
  async getAll(): Promise<CasaDeCambioDto[]> {
    const casas = await this.casaDeCambioRepository.find({
      relations: ['moneda_maestra'],
    });

    return casas.map(casa => this.entityToDto(casa));
  }

  async getById(id: number): Promise<CasaDeCambioDto | null> {
    const casa = await this.casaDeCambioRepository.findOne({
      where: { id },
      relations: ['moneda_maestra'],
    });

    return casa ? this.entityToDto(casa) : null;
  }

  async getByIdentificador(identificador: string): Promise<CasaDeCambioDto | null> {
    const casa = await this.casaDeCambioRepository.findOne({
      where: { identificador },
      relations: ['moneda_maestra'],
    });

    return casa ? this.entityToDto(casa) : null;
  }

  /**
   * Actualiza una casa de cambio con validación
   */
  async update(id: number, request: UpdateCasaDeCambioRequest): Promise<CasaDeCambioDto | null> {
    const casa = await this.casaDeCambioRepository.findOne({ where: { id } });

    if (!casa) {
      return null;
    }

    if (request.moneda_maestra_id) {
      const monedaMaestra = await this.monedaRepository.findOne({
        where: { id: request.moneda_maestra_id, activa: true },
      });

      if (!monedaMaestra) {
        throw new Error('La moneda maestra especificada no existe o no está activa');
      }
    }

    if (request.identificador && request.identificador !== casa.identificador) {
      const existingCasa = await this.casaDeCambioRepository.findOne({
        where: { identificador: request.identificador },
      });

      if (existingCasa) {
        throw new Error('Ya existe una casa de cambio con ese identificador');
      }
    }

    Object.assign(casa, request);
    const updatedCasa = await this.casaDeCambioRepository.save(casa);

    return this.entityToDto(updatedCasa);
  }

  /**
   * Elimina una casa de cambio después de validación
   */
  async delete(id: number): Promise<boolean> {
    const ventanillasCount = await this.ventanillaRepository.count({
      where: { casa_de_cambio_id: id, activa: true },
    });

    if (ventanillasCount > 0) {
      throw new Error('No se puede eliminar la casa de cambio porque tiene ventanillas activas');
    }

    const result = await this.casaDeCambioRepository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }

  /**
   * Verifica si la casa de cambio cumple los requisitos mínimos operacionales
   */
  async verifyMinimumRequirements(id: number): Promise<boolean> {
    const ventanillasCount = await this.ventanillaRepository.count({
      where: { casa_de_cambio_id: id },
    });

    const usuariosCount = await this.usuarioRepository.count({
      where: { casa_de_cambio_id: id },
    });

    const monedasCount = await this.monedaRepository.count({
      where: { activa: true },
    });

    return ventanillasCount >= 1 && usuariosCount >= 1 && monedasCount >= 2;
  }

  private entityToDto(entity: CasaDeCambio): CasaDeCambioDto {
    return {
      id: entity.id,
      identificador: entity.identificador,
      nombre: entity.nombre,
      direccion: entity.direccion,
      telefono: entity.telefono,
      email: entity.email,
      ruc: entity.ruc,
      razon_social: entity.razon_social,
      moneda_maestra_id: entity.moneda_maestra_id,
      activa: entity.activa,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}