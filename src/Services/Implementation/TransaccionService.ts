import { Repository } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { Transaccion } from '../../DbModel/Entities/Transaccion';
import { Cliente } from '../../DbModel/Entities/Cliente';
import { Ventanilla } from '../../DbModel/Entities/Ventanilla';
import { Moneda } from '../../DbModel/Entities/Moneda';
import { TipoCambio } from '../../DbModel/Entities/TipoCambio';
import { AperturaVentanilla } from '../../DbModel/Entities/AperturaVentanilla';
import { MontoApertura } from '../../DbModel/Entities/MontoApertura';
import { CasaDeCambio } from '../../DbModel/Entities/CasaDeCambio';
import { ITransaccionService } from '../ITransaccionService';
import { ProcesarCambioRequest } from '../../Models/Transaccion/TransaccionRequestParams';
import { TransaccionDto } from '../../Models/Transaccion/TransaccionDto';
import { TransaccionResponseDto } from '../../Models/Transaccion/TransaccionResponseDto';
import { EstadoTransaccion, EstadoVentanilla } from '../../DbModel/Enums';

/**
 * Servicio de Transacciones - Lógica de Negocio Principal
 * 
 * Maneja todas las operaciones relacionadas con transacciones de cambio:
 * - Procesamiento de transacciones con/sin cliente
 * - Cálculos de conversión y ganancias
 * - Validaciones de disponibilidad y tipos de cambio
 * - Gestión de inventario de ventanillas
 * - Consultas optimizadas con filtros
 */

export class TransaccionService implements ITransaccionService {
  private transaccionRepository: Repository<Transaccion>;
  private clienteRepository: Repository<Cliente>;
  private ventanillaRepository: Repository<Ventanilla>;
  private monedaRepository: Repository<Moneda>;
  private tipoCambioRepository: Repository<TipoCambio>;
  private aperturaVentanillaRepository: Repository<AperturaVentanilla>;
  private montoAperturaRepository: Repository<MontoApertura>;
  private casaDeCambioRepository: Repository<CasaDeCambio>;

  constructor() {
    this.transaccionRepository = AppDataSource.getRepository(Transaccion);
    this.clienteRepository = AppDataSource.getRepository(Cliente);
    this.ventanillaRepository = AppDataSource.getRepository(Ventanilla);
    this.monedaRepository = AppDataSource.getRepository(Moneda);
    this.tipoCambioRepository = AppDataSource.getRepository(TipoCambio);
    this.aperturaVentanillaRepository = AppDataSource.getRepository(AperturaVentanilla);
    this.montoAperturaRepository = AppDataSource.getRepository(MontoApertura);
    this.casaDeCambioRepository = AppDataSource.getRepository(CasaDeCambio);
  }

  async procesarCambio(request: ProcesarCambioRequest): Promise<TransaccionDto> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar cliente (opcional para transacciones rápidas)
      let cliente = null;
      if (request.clienteId) {
        cliente = await this.clienteRepository.findOne({
          where: { id: request.clienteId },
        });
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
      }

      // 2. Validar ventanilla y su estado
      const ventanilla = await this.ventanillaRepository.findOne({
        where: { id: request.ventanillaId },
        relations: ['casa_de_cambio'],
      });
      if (!ventanilla) {
        throw new Error('Ventanilla no encontrada');
      }
      if (ventanilla.estado !== EstadoVentanilla.ABIERTA) {
        throw new Error('La ventanilla no está abierta para transacciones');
      }

      // 3. Verificar que existe una apertura activa para la ventanilla
      const aperturaActiva = await this.aperturaVentanillaRepository.findOne({
        where: { ventanilla_id: request.ventanillaId, activa: true },
      });
      if (!aperturaActiva) {
        throw new Error('La ventanilla no tiene una apertura activa');
      }

      // 4. Validar monedas
      const [monedaOrigen, monedaDestino] = await Promise.all([
        this.monedaRepository.findOne({ where: { id: request.monedaOrigenId } }),
        this.monedaRepository.findOne({ where: { id: request.monedaDestinoId } }),
      ]);
      if (!monedaOrigen || !monedaDestino) {
        throw new Error('Moneda origen o destino no válida');
      }

      // 5. Obtener tipo de cambio vigente
      const tipoCambio = await this.tipoCambioRepository.findOne({
        where: {
          casa_de_cambio_id: ventanilla.casa_de_cambio.id,
          moneda_origen_id: request.monedaOrigenId,
          moneda_destino_id: request.monedaDestinoId,
          activo: true,
        },
        order: { fecha_vigencia: 'DESC' },
      });
      if (!tipoCambio) {
        throw new Error('No existe tipo de cambio vigente para esta conversión');
      }

      // 6. Calcular conversión y ganancia
      const resultado = await this.calcularConversion(
        request.montoOrigen,
        request.monedaOrigenId,
        request.monedaDestinoId,
        ventanilla.casa_de_cambio.id
      );

      // 7. Verificar disponibilidad de fondos
      const informacionDisponibilidad = await this.verificarDisponibilidadDetallada(
        request.ventanillaId,
        request.monedaDestinoId,
        resultado.montoDestino
      );
      if (!informacionDisponibilidad.disponible) {
        const monedaDestino = await this.monedaRepository.findOne({ where: { id: request.monedaDestinoId } });
        const codigoMoneda = monedaDestino?.codigo || 'Unknown';
        throw new Error(`Fondos insuficientes. Requerido: ${resultado.montoDestino.toFixed(2)} ${codigoMoneda}, Disponible: ${informacionDisponibilidad.montoDisponible?.toFixed(2) || '0.00'} ${codigoMoneda}`);
      }

      // 8. Generar número de transacción único
      const numeroTransaccion = await this.generarNumeroTransaccion();

      // 9. Crear la transacción
      const nuevaTransaccion = new Transaccion();
      nuevaTransaccion.numero_transaccion = numeroTransaccion;
      nuevaTransaccion.monto_origen = request.montoOrigen;
      nuevaTransaccion.monto_destino = resultado.montoDestino;
      nuevaTransaccion.tipo_cambio_aplicado = resultado.tipoCambio;
      nuevaTransaccion.ganancia = resultado.ganancia;
      nuevaTransaccion.estado = EstadoTransaccion.COMPLETADA;
      nuevaTransaccion.observaciones = request.observaciones || '';
      if (request.clienteId) {
        nuevaTransaccion.cliente_id = request.clienteId;
      }
      if (request.clienteTemp) {
        nuevaTransaccion.cliente_temporal = request.clienteTemp;
      }
      nuevaTransaccion.ventanilla_id = request.ventanillaId;
      nuevaTransaccion.moneda_origen_id = request.monedaOrigenId;
      nuevaTransaccion.moneda_destino_id = request.monedaDestinoId;
      nuevaTransaccion.tipo_cambio_id = tipoCambio.id;

      const transaccionGuardada = await queryRunner.manager.save(Transaccion, nuevaTransaccion);

      // 10. Actualizar montos en ventanilla
      await this.actualizarMontosVentanilla(
        queryRunner,
        aperturaActiva.id,
        request.monedaOrigenId,
        request.monedaDestinoId,
        request.montoOrigen,
        resultado.montoDestino
      );

      await queryRunner.commitTransaction();

      return this.mapearADtoBasico(transaccionGuardada as unknown as Transaccion);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene transacciones por ventanilla con filtro opcional de fecha
   */
  async obtenerPorVentanilla(ventanillaId: number, fecha?: Date): Promise<TransaccionDto[]> {
    const queryBuilder = this.transaccionRepository
      .createQueryBuilder('transaccion')
      .leftJoinAndSelect('transaccion.cliente', 'cliente')
      .leftJoinAndSelect('cliente.persona', 'persona')
      .leftJoinAndSelect('transaccion.ventanilla', 'ventanilla')
      .leftJoinAndSelect('transaccion.moneda_origen', 'moneda_origen')
      .leftJoinAndSelect('transaccion.moneda_destino', 'moneda_destino')
      .where('transaccion.ventanilla_id = :ventanillaId', { ventanillaId });

    if (fecha) {
      const inicioDelDia = new Date(fecha);
      inicioDelDia.setHours(0, 0, 0, 0);
      const finDelDia = new Date(fecha);
      finDelDia.setHours(23, 59, 59, 999);
      
      queryBuilder.andWhere('transaccion.created_at BETWEEN :inicio AND :fin', {
        inicio: inicioDelDia,
        fin: finDelDia,
      });
    }

    const transacciones = await queryBuilder
      .orderBy('transaccion.created_at', 'DESC')
      .getMany();

    return transacciones.map(t => this.mapearADtoBasico(t));
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerPorVentanilla() en su lugar
   */
  async getByVentanilla(ventanillaId: number, fecha?: Date): Promise<TransaccionDto[]> {
    return this.obtenerPorVentanilla(ventanillaId, fecha);
  }

  /**
   * Obtiene transacciones por cliente
   */
  async obtenerPorCliente(clienteId: number): Promise<TransaccionDto[]> {
    const transacciones = await this.transaccionRepository
      .createQueryBuilder('transaccion')
      .leftJoinAndSelect('transaccion.cliente', 'cliente')
      .leftJoinAndSelect('cliente.persona', 'persona')
      .leftJoinAndSelect('transaccion.ventanilla', 'ventanilla')
      .leftJoinAndSelect('transaccion.moneda_origen', 'moneda_origen')
      .leftJoinAndSelect('transaccion.moneda_destino', 'moneda_destino')
      .where('transaccion.cliente_id = :clienteId', { clienteId })
      .orderBy('transaccion.created_at', 'DESC')
      .getMany();

    return transacciones.map(t => this.mapearADtoBasico(t));
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerPorCliente() en su lugar
   */
  async getByCliente(clienteId: number): Promise<TransaccionDto[]> {
    return this.obtenerPorCliente(clienteId);
  }

  /**
   * Obtiene transacción por número de transacción
   */
  async obtenerPorNumero(numeroTransaccion: string): Promise<TransaccionDto | null> {
    const transaccion = await this.transaccionRepository
      .createQueryBuilder('transaccion')
      .leftJoinAndSelect('transaccion.cliente', 'cliente')
      .leftJoinAndSelect('cliente.persona', 'persona')
      .leftJoinAndSelect('transaccion.ventanilla', 'ventanilla')
      .leftJoinAndSelect('transaccion.moneda_origen', 'moneda_origen')
      .leftJoinAndSelect('transaccion.moneda_destino', 'moneda_destino')
      .where('transaccion.numero_transaccion = :numeroTransaccion', { numeroTransaccion })
      .getOne();

    return transaccion ? this.mapearADtoBasico(transaccion) : null;
  }

  /**
   * Mantiene compatibilidad con método anterior
   * @deprecated Usar obtenerPorNumero() en su lugar
   */
  async getByNumero(numeroTransaccion: string): Promise<TransaccionDto | null> {
    return this.obtenerPorNumero(numeroTransaccion);
  }

  async cancelar(id: number, motivo: string): Promise<boolean> {
    const transaccion = await this.transaccionRepository.findOne({
      where: { id },
    });

    if (!transaccion) {
      throw new Error('Transacción no encontrada');
    }

    if (transaccion.estado === EstadoTransaccion.CANCELADA) {
      throw new Error('La transacción ya está cancelada');
    }

    await this.transaccionRepository.update(id, {
      estado: EstadoTransaccion.CANCELADA,
      observaciones: `${transaccion.observaciones || ''}\nCANCELADA: ${motivo}`,
    });

    return true;
  }

  async calcularConversion(
    montoOrigen: number,
    monedaOrigenId: number,
    monedaDestinoId: number,
    casaDeCambioId: number
  ): Promise<{ montoDestino: number; tipoCambio: number; ganancia: number }> {
    // Obtener tipo de cambio vigente
    const tipoCambio = await this.tipoCambioRepository.findOne({
      where: {
        casa_de_cambio_id: casaDeCambioId,
        moneda_origen_id: monedaOrigenId,
        moneda_destino_id: monedaDestinoId,
        activo: true,
      },
      order: { fecha_vigencia: 'DESC' },
    });

    if (!tipoCambio) {
      throw new Error('No existe tipo de cambio vigente para esta conversión');
    }

    // Calcular monto destino usando tipo de venta
    const montoDestino = montoOrigen * tipoCambio.tipo_venta;

    // Calcular ganancia (diferencia entre tipo venta y tipo compra)
    const gananciaUnitaria = tipoCambio.tipo_venta - tipoCambio.tipo_compra;
    const ganancia = montoOrigen * gananciaUnitaria;

    return {
      montoDestino: Math.round(montoDestino * 100) / 100, // Redondear a 2 decimales
      tipoCambio: tipoCambio.tipo_venta,
      ganancia: Math.round(ganancia * 100) / 100,
    };
  }

  async verificarDisponibilidad(
    ventanillaId: number,
    monedaId: number,
    monto: number
  ): Promise<boolean> {
    const resultado = await this.verificarDisponibilidadDetallada(ventanillaId, monedaId, monto);
    return resultado.disponible;
  }

  async verificarDisponibilidadDetallada(
    ventanillaId: number,
    monedaId: number,
    monto: number
  ): Promise<{ disponible: boolean; montoDisponible?: number }> {
    // Obtener apertura activa
    const aperturaActiva = await this.aperturaVentanillaRepository.findOne({
      where: { ventanilla_id: ventanillaId, activa: true },
    });

    if (!aperturaActiva) {
      return { disponible: false, montoDisponible: 0 };
    }

    // Obtener monto disponible en la moneda solicitada
    const montoApertura = await this.montoAperturaRepository.findOne({
      where: {
        apertura_ventanilla_id: aperturaActiva.id,
        moneda_id: monedaId,
      },
    });

    if (!montoApertura) {
      return { disponible: false, montoDisponible: 0 };
    }

    // Calcular total usado en transacciones
    const fechaHoy = new Date();
    const inicioDelDia = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate());
    const finDelDia = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate() + 1);
    
    const totalUsado = await this.transaccionRepository
      .createQueryBuilder('transaccion')
      .select('SUM(transaccion.monto_destino)', 'total')
      .where('transaccion.ventanilla_id = :ventanillaId', { ventanillaId })
      .andWhere('transaccion.moneda_destino_id = :monedaId', { monedaId })
      .andWhere('transaccion.estado = :estado', { estado: EstadoTransaccion.COMPLETADA })
      .andWhere('transaccion.created_at >= :inicioDelDia', { inicioDelDia })
      .andWhere('transaccion.created_at < :finDelDia', { finDelDia })
      .getRawOne();

    const montoUsado = parseFloat(totalUsado.total) || 0;
    const montoDisponible = montoApertura.monto - montoUsado;

    return { 
      disponible: montoDisponible >= monto,
      montoDisponible: montoDisponible
    };
  }

  private async generarNumeroTransaccion(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    
    // Obtener el siguiente número secuencial del día usando query builder
    const inicioDelDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const finDelDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1);
    
    const conteoHoy = await this.transaccionRepository
      .createQueryBuilder('transaccion')
      .where('transaccion.created_at >= :inicioDelDia', { inicioDelDia })
      .andWhere('transaccion.created_at < :finDelDia', { finDelDia })
      .getCount();

    const secuencial = (conteoHoy + 1).toString().padStart(4, '0');
    
    return `TX${año}${mes}${dia}${secuencial}`;
  }

  private async actualizarMontosVentanilla(
    queryRunner: any,
    aperturaId: number,
    monedaOrigenId: number,
    monedaDestinoId: number,
    montoOrigen: number,
    montoDestino: number
  ): Promise<void> {
    // Aumentar monto de moneda origen (recibida)
    await queryRunner.manager.query(`
      UPDATE montos_apertura 
      SET monto = monto + $1 
      WHERE apertura_ventanilla_id = $2 AND moneda_id = $3
    `, [montoOrigen, aperturaId, monedaOrigenId]);

    // Disminuir monto de moneda destino (entregada)
    await queryRunner.manager.query(`
      UPDATE montos_apertura 
      SET monto = monto - $1 
      WHERE apertura_ventanilla_id = $2 AND moneda_id = $3
    `, [montoDestino, aperturaId, monedaDestinoId]);
  }

  /**
   * Mapea entidad Transaccion a DTO básico
   */
  private mapearADtoBasico(transaccion: Transaccion): TransaccionDto {
    return {
      id: transaccion.id,
      numero_transaccion: transaccion.numero_transaccion,
      monto_origen: parseFloat(transaccion.monto_origen.toString()),
      monto_destino: parseFloat(transaccion.monto_destino.toString()),
      tipo_cambio_aplicado: parseFloat(transaccion.tipo_cambio_aplicado.toString()),
      ganancia: parseFloat(transaccion.ganancia.toString()),
      estado: transaccion.estado,
      observaciones: transaccion.observaciones,
      cliente_id: transaccion.cliente_id,
      ventanilla_id: transaccion.ventanilla_id,
      moneda_origen_id: transaccion.moneda_origen_id,
      moneda_destino_id: transaccion.moneda_destino_id,
      tipo_cambio_id: transaccion.tipo_cambio_id,
      created_at: transaccion.created_at,
      updated_at: transaccion.updated_at,
    };
  }

  /**
   * Obtiene todas las transacciones con filtros para operaciones rápidas
   */
  async obtenerTodas(filtros?: {
    limit?: number;
    offset?: number;
    ordenar?: string;
    ventanillaId?: number;
  }): Promise<TransaccionResponseDto[]> {
    const queryBuilder = this.transaccionRepository
      .createQueryBuilder('transaccion')
      .leftJoinAndSelect('transaccion.cliente', 'cliente')
      .leftJoinAndSelect('cliente.persona', 'persona')
      .leftJoinAndSelect('transaccion.ventanilla', 'ventanilla')
      .leftJoinAndSelect('transaccion.moneda_origen', 'moneda_origen')
      .leftJoinAndSelect('transaccion.moneda_destino', 'moneda_destino')
      .leftJoinAndSelect('transaccion.tipo_cambio', 'tipo_cambio');

    // Aplicar filtros
    if (filtros?.ventanillaId) {
      queryBuilder.andWhere('transaccion.ventanilla_id = :ventanillaId', { 
        ventanillaId: filtros.ventanillaId 
      });
    }

    // Aplicar ordenamiento
    switch (filtros?.ordenar) {
      case 'fecha_desc':
        queryBuilder.orderBy('transaccion.created_at', 'DESC');
        break;
      case 'fecha_asc':
        queryBuilder.orderBy('transaccion.created_at', 'ASC');
        break;
      case 'monto_desc':
        queryBuilder.orderBy('transaccion.monto_origen', 'DESC');
        break;
      default:
        queryBuilder.orderBy('transaccion.created_at', 'DESC');
    }

    // Aplicar paginación
    if (filtros?.limit) {
      queryBuilder.limit(filtros.limit);
    }
    if (filtros?.offset) {
      queryBuilder.offset(filtros.offset);
    }

    const transacciones = await queryBuilder.getMany();
    return transacciones.map(transaccion => this.mapearADtoExtendido(transaccion));
  }

  /**
   * Mapea entidad a DTO con relaciones incluidas para operaciones rápidas
   */
  private mapearADtoExtendido(transaccion: Transaccion): TransaccionResponseDto {
    return {
      id: transaccion.id,
      numero_transaccion: transaccion.numero_transaccion,
      monto_origen: parseFloat(transaccion.monto_origen.toString()),
      monto_destino: parseFloat(transaccion.monto_destino.toString()),
      tipo_cambio_aplicado: parseFloat(transaccion.tipo_cambio_aplicado.toString()),
      ganancia: parseFloat(transaccion.ganancia.toString()),
      estado: transaccion.estado,
      observaciones: transaccion.observaciones,
      cliente_id: transaccion.cliente_id,
      ventanilla_id: transaccion.ventanilla_id,
      moneda_origen_id: transaccion.moneda_origen_id,
      moneda_destino_id: transaccion.moneda_destino_id,
      tipo_cambio_id: transaccion.tipo_cambio_id,
      cliente: transaccion.cliente ? {
        tipo: transaccion.cliente.tipo,
        descripcion: transaccion.cliente.descripcion,
        persona: transaccion.cliente.persona ? {
          nombres: transaccion.cliente.persona.nombres,
          apellido_paterno: transaccion.cliente.persona.apellido_paterno,
          apellido_materno: transaccion.cliente.persona.apellido_materno,
        } : undefined,
      } : undefined,
      cliente_temporal: transaccion.cliente_temporal,
      ventanilla: transaccion.ventanilla ? {
        identificador: transaccion.ventanilla.identificador,
        nombre: transaccion.ventanilla.nombre,
      } : {
        identificador: '',
        nombre: ''
      },
      moneda_origen: transaccion.moneda_origen ? {
        codigo: transaccion.moneda_origen.codigo,
        simbolo: transaccion.moneda_origen.simbolo,
      } : {
        codigo: '',
        simbolo: ''
      },
      moneda_destino: transaccion.moneda_destino ? {
        codigo: transaccion.moneda_destino.codigo,
        simbolo: transaccion.moneda_destino.simbolo,
      } : {
        codigo: '',
        simbolo: ''
      },
      created_at: transaccion.created_at,
      updated_at: transaccion.updated_at,
    };
  }
}