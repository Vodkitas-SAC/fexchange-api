import { Repository, Not } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { TipoCambio } from '../../DbModel/Entities/TipoCambio';
import { CasaDeCambio } from '../../DbModel/Entities/CasaDeCambio';
import { Moneda } from '../../DbModel/Entities/Moneda';
import { Transaccion } from '../../DbModel/Entities/Transaccion';
import { AuditoriaTipoCambio } from '../../DbModel/Entities/AuditoriaTipoCambio';
import { ITipoCambioService } from '../ITipoCambioService';
import { CreateTipoCambioRequest, UpdateTipoCambioRequest, ConsultarTipoCambioRequest } from '../../Models/TipoCambio/TipoCambioRequestParams';
import { TipoCambioDto } from '../../Models/TipoCambio/TipoCambioDto';

export class TipoCambioService implements ITipoCambioService {
  private tipoCambioRepository: Repository<TipoCambio>;
  private casaDeCambioRepository: Repository<CasaDeCambio>;
  private monedaRepository: Repository<Moneda>;
  private auditoriaRepository: Repository<AuditoriaTipoCambio>;

  constructor() {
    this.tipoCambioRepository = AppDataSource.getRepository(TipoCambio);
    this.casaDeCambioRepository = AppDataSource.getRepository(CasaDeCambio);
    this.monedaRepository = AppDataSource.getRepository(Moneda);
    this.auditoriaRepository = AppDataSource.getRepository(AuditoriaTipoCambio);
  }

  async create(request: CreateTipoCambioRequest): Promise<TipoCambioDto> {
    // Validar casa de cambio
    const casaDeCambio = await this.casaDeCambioRepository.findOne({
      where: { id: request.casa_de_cambio_id },
    });
    if (!casaDeCambio) {
      throw new Error('Casa de cambio no encontrada');
    }

    // Validar monedas
    const [monedaOrigen, monedaDestino] = await Promise.all([
      this.monedaRepository.findOne({ where: { id: request.moneda_origen_id } }),
      this.monedaRepository.findOne({ where: { id: request.moneda_destino_id } }),
    ]);

    if (!monedaOrigen || !monedaDestino) {
      throw new Error('Moneda origen o destino no válida');
    }

    if (request.moneda_origen_id === request.moneda_destino_id) {
      throw new Error('La moneda origen y destino no pueden ser iguales');
    }

    // Validar que tipo_venta sea mayor que tipo_compra
    if (request.tipo_venta <= request.tipo_compra) {
      throw new Error('El tipo de venta debe ser mayor que el tipo de compra');
    }

    // Validar rangos razonables de tipos de cambio
    if (request.tipo_compra < 0.01 || request.tipo_compra > 1000) {
      throw new Error('El tipo de compra debe estar entre 0.01 y 1000');
    }

    if (request.tipo_venta < 0.01 || request.tipo_venta > 1000) {
      throw new Error('El tipo de venta debe estar entre 0.01 y 1000');
    }

    // Validar que la diferencia entre venta y compra sea razonable (máximo 50%)
    const diferenciaPorcentaje = ((request.tipo_venta - request.tipo_compra) / request.tipo_compra) * 100;
    if (diferenciaPorcentaje > 50) {
      throw new Error('La diferencia entre tipo de venta y compra no puede exceder el 50%');
    }

    // Verificar que no exista ya un tipo de cambio activo para el mismo par
    const tipoCambioExistente = await this.tipoCambioRepository.findOne({
      where: {
        casa_de_cambio_id: request.casa_de_cambio_id,
        moneda_origen_id: request.moneda_origen_id,
        moneda_destino_id: request.moneda_destino_id,
        activo: true,
      },
    });

    if (tipoCambioExistente) {
      throw new Error('Ya existe un tipo de cambio activo para este par de monedas. Desactive el actual antes de crear uno nuevo.');
    }

    // Ya no necesitamos desactivar automáticamente porque validamos duplicados arriba

    const nuevoTipoCambio = this.tipoCambioRepository.create({
      tipo_compra: request.tipo_compra,
      tipo_venta: request.tipo_venta,
      fecha_vigencia: new Date(),
      mantener_cambio_diario: request.mantener_cambio_diario || false,
      casa_de_cambio_id: request.casa_de_cambio_id,
      moneda_origen_id: request.moneda_origen_id,
      moneda_destino_id: request.moneda_destino_id,
      activo: true,
    });

    // TODO: Implementar lógica de mantener_cambio_diario
    // Si mantener_cambio_diario es true, este tipo de cambio se debería:
    // 1. Auto-reactivar diariamente cuando se abra la primera ventanilla
    // 2. Mantener como tipo de cambio preferencial para la casa de cambio
    // 3. Registrarse automáticamente si no hay tipos de cambio activos para el par

    const tipoCambioGuardado = await this.tipoCambioRepository.save(nuevoTipoCambio);
    
    // Registrar auditoría
    await this.registrarAuditoria(
      tipoCambioGuardado.id,
      1, // TODO: Obtener usuario real del contexto
      AuditoriaTipoCambio.paraCreacion(tipoCambioGuardado.id, 1, {
        tipo_compra: tipoCambioGuardado.tipo_compra,
        tipo_venta: tipoCambioGuardado.tipo_venta,
        fecha_vigencia: tipoCambioGuardado.fecha_vigencia,
        mantener_cambio_diario: tipoCambioGuardado.mantener_cambio_diario,
        casa_de_cambio_id: tipoCambioGuardado.casa_de_cambio_id,
        moneda_origen_id: tipoCambioGuardado.moneda_origen_id,
        moneda_destino_id: tipoCambioGuardado.moneda_destino_id,
        activo: tipoCambioGuardado.activo,
      })
    );
    
    return this.mapToDto(tipoCambioGuardado);
  }

  async getById(id: number): Promise<TipoCambioDto | null> {
    const tipoCambio = await this.tipoCambioRepository.findOne({
      where: { id },
      relations: ['casa_de_cambio', 'moneda_origen', 'moneda_destino'],
    });

    return tipoCambio ? this.mapToDto(tipoCambio) : null;
  }

  async getAll(): Promise<TipoCambioDto[]> {
    const tiposCambio = await this.tipoCambioRepository.find({
      where: { activo: true },
      relations: ['casa_de_cambio', 'moneda_origen', 'moneda_destino'],
      order: { fecha_vigencia: 'DESC' },
    });

    return tiposCambio.map(tc => this.mapToDto(tc));
  }

  async getByCasaDeCambio(casaDeCambioId: number): Promise<TipoCambioDto[]> {
    const tiposCambio = await this.tipoCambioRepository.find({
      where: { casa_de_cambio_id: casaDeCambioId },
      relations: ['casa_de_cambio', 'moneda_origen', 'moneda_destino'],
      order: { fecha_vigencia: 'DESC' },
    });

    return tiposCambio.map(tc => this.mapToDto(tc));
  }

  /**
   * Obtiene tipos de cambio activos por casa de cambio con formato para operaciones rápidas
   */
  async getActivosPorCasa(casaDeCambioId: number): Promise<{
    id: number;
    par_monedas: string;
    tipo_compra: number;
    tipo_venta: number;
    moneda_origen_id: number;
    moneda_destino_id: number;
    moneda_origen: {
      codigo: string;
      simbolo: string;
    };
    moneda_destino: {
      codigo: string;
      simbolo: string;
    };
  }[]> {
    const tiposCambio = await this.tipoCambioRepository.find({
      where: { casa_de_cambio_id: casaDeCambioId, activo: true },
      relations: ['moneda_origen', 'moneda_destino'],
      order: { 
        moneda_origen: { codigo: 'ASC' }, 
        moneda_destino: { codigo: 'ASC' } 
      },
    });

    return tiposCambio.map(tc => ({
      id: tc.id,
      par_monedas: `${tc.moneda_origen.codigo}/${tc.moneda_destino.codigo}`,
      tipo_compra: parseFloat(tc.tipo_compra.toString()),
      tipo_venta: parseFloat(tc.tipo_venta.toString()),
      moneda_origen_id: tc.moneda_origen_id,
      moneda_destino_id: tc.moneda_destino_id,
      moneda_origen: {
        codigo: tc.moneda_origen.codigo,
        simbolo: tc.moneda_origen.simbolo,
      },
      moneda_destino: {
        codigo: tc.moneda_destino.codigo,
        simbolo: tc.moneda_destino.simbolo,
      },
    }));
  }

  async getTipoCambioVigente(request: ConsultarTipoCambioRequest): Promise<TipoCambioDto | null> {
    const fecha = request.fecha || new Date();
    
    const tipoCambio = await this.tipoCambioRepository.findOne({
      where: {
        casa_de_cambio_id: request.casa_de_cambio_id,
        moneda_origen_id: request.moneda_origen_id,
        moneda_destino_id: request.moneda_destino_id,
        activo: true,
      },
      relations: ['casa_de_cambio', 'moneda_origen', 'moneda_destino'],
      order: { fecha_vigencia: 'DESC' },
    });

    return tipoCambio ? this.mapToDto(tipoCambio) : null;
  }

  async getHistorial(
    monedaOrigenId: number,
    monedaDestinoId: number,
    casaDeCambioId: number,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<TipoCambioDto[]> {
    const queryBuilder = this.tipoCambioRepository
      .createQueryBuilder('tipo_cambio')
      .leftJoinAndSelect('tipo_cambio.casa_de_cambio', 'casa')
      .leftJoinAndSelect('tipo_cambio.moneda_origen', 'origen')
      .leftJoinAndSelect('tipo_cambio.moneda_destino', 'destino')
      .where('tipo_cambio.casa_de_cambio_id = :casaDeCambioId', { casaDeCambioId })
      .andWhere('tipo_cambio.moneda_origen_id = :monedaOrigenId', { monedaOrigenId })
      .andWhere('tipo_cambio.moneda_destino_id = :monedaDestinoId', { monedaDestinoId });

    if (fechaInicio) {
      queryBuilder.andWhere('tipo_cambio.fecha_vigencia >= :fechaInicio', { fechaInicio });
    }

    if (fechaFin) {
      queryBuilder.andWhere('tipo_cambio.fecha_vigencia <= :fechaFin', { fechaFin });
    }

    const tiposCambio = await queryBuilder
      .orderBy('tipo_cambio.fecha_vigencia', 'DESC')
      .getMany();

    return tiposCambio.map(tc => this.mapToDto(tc));
  }

  async update(id: number, request: UpdateTipoCambioRequest): Promise<TipoCambioDto> {
    const tipoCambioExistente = await this.tipoCambioRepository.findOne({
      where: { id },
    });

    if (!tipoCambioExistente) {
      throw new Error('Tipo de cambio no encontrado');
    }

    // Validar que tipo_venta sea mayor que tipo_compra si se proporcionan ambos
    const tipoCompra = request.tipo_compra || tipoCambioExistente.tipo_compra;
    const tipoVenta = request.tipo_venta || tipoCambioExistente.tipo_venta;

    if (tipoVenta <= tipoCompra) {
      throw new Error('El tipo de venta debe ser mayor que el tipo de compra');
    }

    // Validar rangos razonables si se proporcionan valores
    if (request.tipo_compra !== undefined) {
      if (request.tipo_compra < 0.01 || request.tipo_compra > 1000) {
        throw new Error('El tipo de compra debe estar entre 0.01 y 1000');
      }
    }

    if (request.tipo_venta !== undefined) {
      if (request.tipo_venta < 0.01 || request.tipo_venta > 1000) {
        throw new Error('El tipo de venta debe estar entre 0.01 y 1000');
      }
    }

    // Validar que la diferencia entre venta y compra sea razonable (máximo 50%)
    const diferenciaPorcentaje = ((tipoVenta - tipoCompra) / tipoCompra) * 100;
    if (diferenciaPorcentaje > 50) {
      throw new Error('La diferencia entre tipo de venta y compra no puede exceder el 50%');
    }

    // Validar fecha de vigencia si se proporciona
    if (request.fecha_vigencia !== undefined) {
      const fechaVigencia = new Date(request.fecha_vigencia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normalizar a inicio de día
      
      if (fechaVigencia < hoy) {
        throw new Error('La fecha de vigencia no puede ser anterior a hoy');
      }
    }

    // Si se está activando el tipo de cambio, verificar que no haya otro activo para el mismo par
    if (request.activo === true) {
      const otroTipoActivo = await this.tipoCambioRepository.findOne({
        where: {
          casa_de_cambio_id: tipoCambioExistente.casa_de_cambio_id,
          moneda_origen_id: tipoCambioExistente.moneda_origen_id,
          moneda_destino_id: tipoCambioExistente.moneda_destino_id,
          activo: true,
          id: Not(tipoCambioExistente.id), // Excluir el actual
        },
      });

      if (otroTipoActivo) {
        throw new Error('Ya existe otro tipo de cambio activo para este par de monedas. Desactive el otro primero.');
      }
    }

    // Si se está activando mantener_cambio_diario, desactivar en otros registros del mismo par
    if (request.mantener_cambio_diario === true) {
      await this.tipoCambioRepository.update(
        {
          casa_de_cambio_id: tipoCambioExistente.casa_de_cambio_id,
          moneda_origen_id: tipoCambioExistente.moneda_origen_id,
          moneda_destino_id: tipoCambioExistente.moneda_destino_id,
          mantener_cambio_diario: true,
        },
        { mantener_cambio_diario: false }
      );
    }

    // Actualizar campos
    const camposActualizar: any = {};
    if (request.tipo_compra !== undefined) camposActualizar.tipo_compra = request.tipo_compra;
    if (request.tipo_venta !== undefined) camposActualizar.tipo_venta = request.tipo_venta;
    if (request.activo !== undefined) camposActualizar.activo = request.activo;
    if (request.fecha_vigencia !== undefined) camposActualizar.fecha_vigencia = request.fecha_vigencia;
    if (request.mantener_cambio_diario !== undefined) camposActualizar.mantener_cambio_diario = request.mantener_cambio_diario;

    await this.tipoCambioRepository.update(id, camposActualizar);

    const tipoCambioActualizado = await this.tipoCambioRepository.findOne({
      where: { id },
      relations: ['casa_de_cambio', 'moneda_origen', 'moneda_destino'],
    });

    return this.mapToDto(tipoCambioActualizado!);
  }

  async desactivar(id: number): Promise<boolean> {
    const result = await this.tipoCambioRepository.update(id, { activo: false });
    return result.affected !== undefined && result.affected > 0;
  }

  async activar(id: number): Promise<boolean> {
    const tipoCambio = await this.tipoCambioRepository.findOne({
      where: { id },
    });

    if (!tipoCambio) {
      throw new Error('Tipo de cambio no encontrado');
    }

    // Desactivar otros tipos de cambio para la misma conversión
    await this.tipoCambioRepository.update(
      {
        casa_de_cambio_id: tipoCambio.casa_de_cambio_id,
        moneda_origen_id: tipoCambio.moneda_origen_id,
        moneda_destino_id: tipoCambio.moneda_destino_id,
        activo: true,
      },
      { activo: false }
    );

    // Activar el tipo de cambio específico
    const result = await this.tipoCambioRepository.update(id, { activo: true });
    return result.affected !== undefined && result.affected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const tipoCambio = await this.tipoCambioRepository.findOne({
      where: { id },
    });

    if (!tipoCambio) {
      throw new Error('Tipo de cambio no encontrado');
    }

    // Verificar si hay transacciones que usan específicamente este tipo de cambio
    const transaccionRepository = AppDataSource.getRepository(Transaccion);
    
    const transaccionesCount = await transaccionRepository.count({
      where: { 
        tipo_cambio_id: id
      }
    });

    if (transaccionesCount > 0) {
      throw new Error('No se puede eliminar el tipo de cambio porque existen transacciones asociadas');
    }

    const result = await this.tipoCambioRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async isDisponible(
    monedaOrigenId: number,
    monedaDestinoId: number,
    casaDeCambioId: number,
    fecha?: Date
  ): Promise<boolean> {
    const tipoCambio = await this.getTipoCambioVigente({
      moneda_origen_id: monedaOrigenId,
      moneda_destino_id: monedaDestinoId,
      casa_de_cambio_id: casaDeCambioId,
      fecha,
    });

    return tipoCambio !== null;
  }

  async getParesDisponibles(casaDeCambioId: number): Promise<{
    moneda_origen: any;
    moneda_destino: any;
    tipo_cambio: TipoCambioDto;
  }[]> {
    const tiposCambio = await this.tipoCambioRepository.find({
      where: { casa_de_cambio_id: casaDeCambioId, activo: true },
      relations: ['moneda_origen', 'moneda_destino'],
      order: { moneda_origen: { codigo: 'ASC' }, moneda_destino: { codigo: 'ASC' } },
    });

    return tiposCambio.map(tc => ({
      moneda_origen: {
        id: tc.moneda_origen.id,
        codigo: tc.moneda_origen.codigo,
        nombre: tc.moneda_origen.nombre,
        simbolo: tc.moneda_origen.simbolo,
      },
      moneda_destino: {
        id: tc.moneda_destino.id,
        codigo: tc.moneda_destino.codigo,
        nombre: tc.moneda_destino.nombre,
        simbolo: tc.moneda_destino.simbolo,
      },
      tipo_cambio: this.mapToDto(tc),
    }));
  }

  async getTiposCambioActuales(casaDeCambioId?: number): Promise<{
    par_monedas: string;
    compra: number;
    venta: number;
    ultima_actualizacion: Date;
    moneda_origen: any;
    moneda_destino: any;
  }[]> {
    const whereCondition: any = { activo: true };
    if (casaDeCambioId) {
      whereCondition.casa_de_cambio_id = casaDeCambioId;
    }

    const tiposCambio = await this.tipoCambioRepository.find({
      where: whereCondition,
      relations: ['moneda_origen', 'moneda_destino', 'casa_de_cambio'],
      order: { 
        moneda_origen: { codigo: 'ASC' }, 
        moneda_destino: { codigo: 'ASC' } 
      },
    });

    return tiposCambio.map(tc => ({
      par_monedas: `${tc.moneda_origen.codigo}/${tc.moneda_destino.codigo}`,
      compra: parseFloat(tc.tipo_compra.toString()),
      venta: parseFloat(tc.tipo_venta.toString()),
      ultima_actualizacion: tc.updated_at,
      moneda_origen: {
        id: tc.moneda_origen.id,
        codigo: tc.moneda_origen.codigo,
        nombre: tc.moneda_origen.nombre,
        simbolo: tc.moneda_origen.simbolo,
      },
      moneda_destino: {
        id: tc.moneda_destino.id,
        codigo: tc.moneda_destino.codigo,
        nombre: tc.moneda_destino.nombre,
        simbolo: tc.moneda_destino.simbolo,
      },
    }));
  }

  /**
   * Registra una entrada de auditoría
   */
  private async registrarAuditoria(
    tipoCambioId: number,
    usuarioId: number,
    datosAuditoria: Partial<AuditoriaTipoCambio>
  ): Promise<void> {
    try {
      const auditoria = this.auditoriaRepository.create(datosAuditoria);
      await this.auditoriaRepository.save(auditoria);
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Error registrando auditoría:', error);
    }
  }

  /**
   * Obtiene el historial de auditoría para un tipo de cambio específico
   */
  async getHistorialAuditoria(tipoCambioId: number): Promise<AuditoriaTipoCambio[]> {
    return await this.auditoriaRepository.find({
      where: { tipo_cambio_id: tipoCambioId },
      relations: ['usuario'],
      order: { created_at: 'DESC' }
    });
  }

  private mapToDto(tipoCambio: TipoCambio): TipoCambioDto {
    return {
      id: tipoCambio.id,
      tipo_compra: parseFloat(tipoCambio.tipo_compra.toString()),
      tipo_venta: parseFloat(tipoCambio.tipo_venta.toString()),
      activo: tipoCambio.activo,
      fecha_vigencia: tipoCambio.fecha_vigencia,
      mantener_cambio_diario: tipoCambio.mantener_cambio_diario,
      casa_de_cambio_id: tipoCambio.casa_de_cambio_id,
      moneda_origen_id: tipoCambio.moneda_origen_id,
      moneda_destino_id: tipoCambio.moneda_destino_id,
      created_at: tipoCambio.created_at,
      updated_at: tipoCambio.updated_at,
    };
  }
}