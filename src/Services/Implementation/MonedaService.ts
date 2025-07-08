import { Repository, Like } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { Moneda } from '../../DbModel/Entities/Moneda';
import { CasaDeCambio } from '../../DbModel/Entities/CasaDeCambio';
import { TipoCambio } from '../../DbModel/Entities/TipoCambio';
import { MontoApertura } from '../../DbModel/Entities/MontoApertura';
import { MontoCierre } from '../../DbModel/Entities/MontoCierre';
import { IMonedaService } from '../IMonedaService';
import { CreateMonedaRequest, UpdateMonedaRequest } from '../../Models/Moneda/MonedaRequestParams';
import { MonedaDto } from '../../Models/Moneda/MonedaDto';

export class MonedaService implements IMonedaService {
  private monedaRepository: Repository<Moneda>;
  private casaDeCambioRepository: Repository<CasaDeCambio>;
  private tipoCambioRepository: Repository<TipoCambio>;
  private montoAperturaRepository: Repository<MontoApertura>;
  private montoCierreRepository: Repository<MontoCierre>;

  constructor() {
    this.monedaRepository = AppDataSource.getRepository(Moneda);
    this.casaDeCambioRepository = AppDataSource.getRepository(CasaDeCambio);
    this.tipoCambioRepository = AppDataSource.getRepository(TipoCambio);
    this.montoAperturaRepository = AppDataSource.getRepository(MontoApertura);
    this.montoCierreRepository = AppDataSource.getRepository(MontoCierre);
  }

  /**
   * Crea una nueva moneda con validación de código único
   */
  async create(request: CreateMonedaRequest): Promise<MonedaDto> {
    // Verificar que el código es único
    const existingMoneda = await this.monedaRepository.findOne({
      where: { codigo: request.codigo.toUpperCase() },
    });

    if (existingMoneda) {
      throw new Error('Ya existe una moneda con ese código');
    }

    // Crear la moneda con código en mayúsculas
    const moneda = this.monedaRepository.create({
      ...request,
      codigo: request.codigo.toUpperCase(),
    });

    const savedMoneda = await this.monedaRepository.save(moneda);
    return this.entityToDto(savedMoneda);
  }

  /**
   * Obtiene todas las monedas con opción de incluir inactivas
   */
  async getAll(includeInactive: boolean = false): Promise<MonedaDto[]> {
    const whereCondition = includeInactive ? {} : { activa: true };
    
    const monedas = await this.monedaRepository.find({
      where: whereCondition,
      order: { codigo: 'ASC' },
    });

    return monedas.map(moneda => this.entityToDto(moneda));
  }

  async getActive(): Promise<MonedaDto[]> {
    return this.getAll(false);
  }

  async getById(id: number): Promise<MonedaDto | null> {
    const moneda = await this.monedaRepository.findOne({
      where: { id },
    });

    return moneda ? this.entityToDto(moneda) : null;
  }

  async getByCodigo(codigo: string): Promise<MonedaDto | null> {
    const moneda = await this.monedaRepository.findOne({
      where: { codigo: codigo.toUpperCase() },
    });

    return moneda ? this.entityToDto(moneda) : null;
  }

  /**
   * Actualiza una moneda con validaciones de negocio
   */
  async update(id: number, request: UpdateMonedaRequest): Promise<MonedaDto | null> {
    const moneda = await this.monedaRepository.findOne({ where: { id } });

    if (!moneda) {
      return null;
    }

    // Si se cambia el código, verificar que es único
    if (request.codigo && request.codigo.toUpperCase() !== moneda.codigo) {
      const existingMoneda = await this.monedaRepository.findOne({
        where: { codigo: request.codigo.toUpperCase() },
      });

      if (existingMoneda) {
        throw new Error('Ya existe una moneda con ese código');
      }

      request.codigo = request.codigo.toUpperCase();
    }

    // Si se está desactivando, verificar que no sea moneda maestra de ninguna casa de cambio
    if (request.activa === false && moneda.activa === true) {
      const casasUsandoMoneda = await this.casaDeCambioRepository.count({
        where: { moneda_maestra_id: id },
      });

      if (casasUsandoMoneda > 0) {
        throw new Error('No se puede desactivar la moneda porque es moneda maestra de una o más casas de cambio');
      }
    }

    Object.assign(moneda, request);
    const updatedMoneda = await this.monedaRepository.save(moneda);

    return this.entityToDto(updatedMoneda);
  }

  /**
   * Activa o desactiva una moneda con validaciones de dependencias
   */
  async toggleActive(id: number): Promise<MonedaDto | null> {
    const moneda = await this.monedaRepository.findOne({ where: { id } });

    if (!moneda) {
      return null;
    }

    // Si se está desactivando, verificar que no sea moneda maestra
    if (moneda.activa === true) {
      const casasUsandoMoneda = await this.casaDeCambioRepository.count({
        where: { moneda_maestra_id: id },
      });

      if (casasUsandoMoneda > 0) {
        throw new Error('No se puede desactivar la moneda porque es moneda maestra de una o más casas de cambio');
      }
    }

    moneda.activa = !moneda.activa;
    const updatedMoneda = await this.monedaRepository.save(moneda);

    return this.entityToDto(updatedMoneda);
  }

  /**
   * Elimina una moneda verificando que no tenga dependencias
   */
  async delete(id: number): Promise<boolean> {
    // Verificar que la moneda puede ser eliminada
    const canDelete = await this.canBeDeleted(id);
    
    if (!canDelete) {
      throw new Error('No se puede eliminar la moneda porque está siendo utilizada');
    }

    const result = await this.monedaRepository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }

  /**
   * Verifica si una moneda puede ser eliminada según sus dependencias
   */
  async canBeDeleted(id: number): Promise<boolean> {
    // Verificar que no sea moneda maestra de ninguna casa de cambio
    const casasUsandoMoneda = await this.casaDeCambioRepository.count({
      where: { moneda_maestra_id: id },
    });

    if (casasUsandoMoneda > 0) {
      return false;
    }

    // Verificar que no tenga tipos de cambio asociados
    const tiposCambio = await this.tipoCambioRepository.count({
      where: [
        { moneda_origen_id: id },
        { moneda_destino_id: id },
      ],
    });

    if (tiposCambio > 0) {
      return false;
    }

    // Verificar que no tenga montos de apertura/cierre
    const montosApertura = await this.montoAperturaRepository.count({
      where: { moneda_id: id },
    });

    const montosCierre = await this.montoCierreRepository.count({
      where: { moneda_id: id },
    });

    return montosApertura === 0 && montosCierre === 0;
  }

  /**
   * Busca monedas por código, nombre o símbolo
   */
  async search(searchTerm: string): Promise<MonedaDto[]> {
    const monedas = await this.monedaRepository.find({
      where: [
        { codigo: Like(`%${searchTerm.toUpperCase()}%`) },
        { nombre: Like(`%${searchTerm}%`) },
        { simbolo: Like(`%${searchTerm}%`) },
      ],
      order: { codigo: 'ASC' },
    });

    return monedas.map(moneda => this.entityToDto(moneda));
  }

  private entityToDto(entity: Moneda): MonedaDto {
    return {
      id: entity.id,
      codigo: entity.codigo,
      nombre: entity.nombre,
      simbolo: entity.simbolo,
      decimales: entity.decimales,
      activa: entity.activa,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}