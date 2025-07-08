import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { Ventanilla } from '../../DbModel/Entities/Ventanilla';
import { CasaDeCambio } from '../../DbModel/Entities/CasaDeCambio';
import { Usuario } from '../../DbModel/Entities/Usuario';
import { AperturaVentanilla } from '../../DbModel/Entities/AperturaVentanilla';
import { CierreVentanilla } from '../../DbModel/Entities/CierreVentanilla';
import { MontoApertura } from '../../DbModel/Entities/MontoApertura';
import { MontoCierre } from '../../DbModel/Entities/MontoCierre';
import { Transaccion } from '../../DbModel/Entities/Transaccion';
import { Moneda } from '../../DbModel/Entities/Moneda';
import { TipoCambio } from '../../DbModel/Entities/TipoCambio';
import { IVentanillaService } from '../IVentanillaService';
import { VentanillaDto } from '../../Models/Ventanilla/VentanillaDto';
import { CreateVentanillaRequest, UpdateVentanillaRequest, AperturarVentanillaRequest } from '../../Models/Ventanilla/VentanillaRequestParams';
import { CierreVentanillaRequest } from '../../Models/Ventanilla/CierreVentanillaRequestParams';
import { CierreVentanillaResumenDto, MontoCierreDto } from '../../Models/Ventanilla/CierreVentanillaDto';
import { EstadoVentanilla } from '../../DbModel/Enums';

export class VentanillaService implements IVentanillaService {
  private ventanillaRepository: Repository<Ventanilla>;
  private casaDeCambioRepository: Repository<CasaDeCambio>;
  private usuarioRepository: Repository<Usuario>;
  private aperturaRepository: Repository<AperturaVentanilla>;
  private cierreRepository: Repository<CierreVentanilla>;
  private montoAperturaRepository: Repository<MontoApertura>;
  private montoCierreRepository: Repository<MontoCierre>;
  private transaccionRepository: Repository<Transaccion>;
  private monedaRepository: Repository<Moneda>;
  private tipoCambioRepository: Repository<TipoCambio>;

  constructor() {
    this.ventanillaRepository = AppDataSource.getRepository(Ventanilla);
    this.casaDeCambioRepository = AppDataSource.getRepository(CasaDeCambio);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.aperturaRepository = AppDataSource.getRepository(AperturaVentanilla);
    this.cierreRepository = AppDataSource.getRepository(CierreVentanilla);
    this.montoAperturaRepository = AppDataSource.getRepository(MontoApertura);
    this.montoCierreRepository = AppDataSource.getRepository(MontoCierre);
    this.transaccionRepository = AppDataSource.getRepository(Transaccion);
    this.monedaRepository = AppDataSource.getRepository(Moneda);
    this.tipoCambioRepository = AppDataSource.getRepository(TipoCambio);
  }

  /**
   * Retrieves all ventanillas with casa de cambio relations
   */
  async getAll(): Promise<VentanillaDto[]> {
    const ventanillas = await this.ventanillaRepository.find({
      relations: ['casa_de_cambio'],
      order: { created_at: 'DESC' },
    });

    return ventanillas.map(ventanilla => this.entityToDto(ventanilla));
  }

  /**
   * Creates a new ventanilla with validation
   */
  async create(request: CreateVentanillaRequest): Promise<VentanillaDto> {
    const casaDeCambio = await this.casaDeCambioRepository.findOne({
      where: { id: request.casa_de_cambio_id },
    });

    if (!casaDeCambio) {
      throw new Error('La casa de cambio especificada no existe');
    }

    const existingVentanilla = await this.ventanillaRepository.findOne({
      where: { identificador: request.identificador },
    });

    if (existingVentanilla) {
      throw new Error('Ya existe una ventanilla con ese identificador');
    }

    const ventanilla = this.ventanillaRepository.create({
      ...request,
      estado: EstadoVentanilla.CERRADA,
      activa: true,
    });

    const savedVentanilla = await this.ventanillaRepository.save(ventanilla);
    return this.entityToDto(savedVentanilla);
  }

  async getByCasaDeCambio(casaDeCambioId: number): Promise<VentanillaDto[]> {
    const ventanillas = await this.ventanillaRepository.find({
      where: { casa_de_cambio_id: casaDeCambioId },
      order: { identificador: 'ASC' },
    });

    return ventanillas.map(ventanilla => this.entityToDto(ventanilla));
  }

  async getByEstado(casaDeCambioId: number, estado: string): Promise<VentanillaDto[]> {
    const ventanillas = await this.ventanillaRepository.find({
      where: { 
        casa_de_cambio_id: casaDeCambioId,
        estado: estado as EstadoVentanilla,
      },
      order: { identificador: 'ASC' },
    });

    return ventanillas.map(ventanilla => this.entityToDto(ventanilla));
  }

  async getById(id: number): Promise<VentanillaDto | null> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { id },
    });

    return ventanilla ? this.entityToDto(ventanilla) : null;
  }

  async getByIdentificador(identificador: string): Promise<VentanillaDto | null> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { identificador },
    });

    return ventanilla ? this.entityToDto(ventanilla) : null;
  }

  /**
   * Updates a ventanilla with validation
   */
  async update(id: number, request: UpdateVentanillaRequest): Promise<VentanillaDto | null> {
    const ventanilla = await this.ventanillaRepository.findOne({ where: { id } });

    if (!ventanilla) {
      return null;
    }

    if (request.identificador && request.identificador !== ventanilla.identificador) {
      const existingVentanilla = await this.ventanillaRepository.findOne({
        where: { identificador: request.identificador },
      });

      if (existingVentanilla) {
        throw new Error('Ya existe una ventanilla con ese identificador');
      }
    }

    Object.assign(ventanilla, request);
    const updatedVentanilla = await this.ventanillaRepository.save(ventanilla);

    return this.entityToDto(updatedVentanilla);
  }

  async toggleActive(id: number): Promise<VentanillaDto | null> {
    const ventanilla = await this.ventanillaRepository.findOne({ where: { id } });

    if (!ventanilla) {
      return null;
    }

    // Si se está desactivando, verificar que esté cerrada
    if (ventanilla.activa === true && ventanilla.estado !== EstadoVentanilla.CERRADA) {
      throw new Error('No se puede desactivar una ventanilla que no está cerrada');
    }

    ventanilla.activa = !ventanilla.activa;
    const updatedVentanilla = await this.ventanillaRepository.save(ventanilla);

    return this.entityToDto(updatedVentanilla);
  }

  /**
   * Opens a ventanilla with validation and apertura creation
   */
  async aperturar(ventanillaId: number, request: AperturarVentanillaRequest): Promise<AperturaVentanilla> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { id: ventanillaId },
    });

    if (!ventanilla) {
      throw new Error('Ventanilla no encontrada');
    }

    if (!ventanilla.activa) {
      throw new Error('No se puede aperturar una ventanilla inactiva');
    }

    if (ventanilla.estado !== EstadoVentanilla.CERRADA) {
      throw new Error('La ventanilla ya está aperturada');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { 
        id: request.usuario_id,
        casa_de_cambio_id: ventanilla.casa_de_cambio_id,
      },
    });

    if (!usuario) {
      throw new Error('Usuario no válido para esta casa de cambio');
    }

    if (!request.montos_apertura || request.montos_apertura.length === 0) {
      throw new Error('Debe especificar al menos un monto de apertura');
    }

    const hayMontoValido = request.montos_apertura.some(monto => monto.monto > 0);
    if (!hayMontoValido) {
      throw new Error('Al menos un monto de apertura debe ser mayor a 0');
    }

    // Auto-registrar tipos de cambio con mantener_cambio_diario activado
    await this.autoRegistrarTiposCambioMantenidos(ventanilla.casa_de_cambio_id);

    // Validar que existan tipos de cambio configurados para la casa de cambio
    const tiposCambioDisponibles = await this.verificarTiposCambioDisponibles(ventanilla.casa_de_cambio_id);
    if (tiposCambioDisponibles.length === 0) {
      throw new Error('No se puede aperturar la ventanilla. Debe configurar al menos un tipo de cambio activo para esta casa de cambio.');
    }

    const today = new Date();
    const timeNow = new Date().toTimeString().split(' ')[0];

    const apertura = this.aperturaRepository.create({
      ventanilla_id: ventanillaId,
      usuario_id: request.usuario_id,
      fecha_apertura: today,
      hora_apertura: timeNow,
      observaciones_apertura: request.observaciones_apertura,
      activa: true,
    });

    const savedApertura = await this.aperturaRepository.save(apertura);

    for (const montoData of request.montos_apertura) {
      const montoApertura = this.montoAperturaRepository.create({
        apertura_ventanilla_id: savedApertura.id,
        moneda_id: montoData.moneda_id,
        monto: montoData.monto,
      });

      await this.montoAperturaRepository.save(montoApertura);
    }

    ventanilla.estado = EstadoVentanilla.ABIERTA;
    await this.ventanillaRepository.save(ventanilla);

    const aperturaCompleta = await this.aperturaRepository.findOne({
      where: { id: savedApertura.id },
      relations: ['ventanilla', 'usuario', 'montos_apertura'],
    });

    return aperturaCompleta!;
  }

  async cerrar(ventanillaId: number, request: CierreVentanillaRequest): Promise<CierreVentanilla> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { id: ventanillaId },
    });

    if (!ventanilla) {
      throw new Error('Ventanilla no encontrada');
    }

    if (ventanilla.estado !== EstadoVentanilla.ABIERTA) {
      throw new Error('La ventanilla no está abierta');
    }

    // Obtener apertura activa
    const aperturaActiva = await this.getAperturaActiva(ventanillaId);
    if (!aperturaActiva) {
      throw new Error('No se encontró apertura activa para esta ventanilla');
    }

    // Note: usuario_id verification removed as it's not part of CierreVentanillaRequest
    // In production, you might want to get the user ID from the authenticated request context

    // Calcular ganancia total (simplificado - en producción sería más complejo)
    const gananciaTotal = await this.calcularGananciaTotal(ventanillaId, aperturaActiva.created_at);

    const today = new Date();
    const timeNow = new Date().toTimeString().split(' ')[0];

    // Crear cierre
    const cierre = this.cierreRepository.create({
      ventanilla_id: ventanillaId,
      usuario_id: aperturaActiva.usuario_id, // Use the user who opened the ventanilla
      apertura_ventanilla_id: aperturaActiva.id,
      fecha_cierre: today,
      hora_cierre: timeNow,
      ganancia_total: gananciaTotal,
      observaciones_cierre: request.observaciones_cierre,
    });

    const savedCierre = await this.cierreRepository.save(cierre);

    // Crear montos de cierre
    for (const montoData of request.montos_cierre) {
      const montoCierre = this.montoCierreRepository.create({
        cierre_ventanilla_id: savedCierre.id,
        moneda_id: montoData.moneda_id,
        monto: montoData.monto_fisico_real,
      });

      await this.montoCierreRepository.save(montoCierre);
    }

    // Actualizar estado de la ventanilla y desactivar apertura
    ventanilla.estado = EstadoVentanilla.CERRADA;
    await this.ventanillaRepository.save(ventanilla);

    aperturaActiva.activa = false;
    await this.aperturaRepository.save(aperturaActiva);

    // Recargar con relaciones
    const cierreCompleto = await this.cierreRepository.findOne({
      where: { id: savedCierre.id },
      relations: ['ventanilla', 'usuario', 'montos_cierre'],
    });

    return cierreCompleto!;
  }

  async pausar(ventanillaId: number, usuarioId: number): Promise<VentanillaDto | null> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { id: ventanillaId },
    });

    if (!ventanilla) {
      return null;
    }

    if (ventanilla.estado !== EstadoVentanilla.ABIERTA) {
      throw new Error('Solo se puede pausar una ventanilla abierta');
    }

    // Verificar permisos usando el nuevo método
    const permisos = await this.puedeOperarVentanilla(ventanillaId, usuarioId);
    if (!permisos.puede_operar) {
      throw new Error(permisos.motivo || 'Sin permisos para pausar esta ventanilla');
    }

    ventanilla.estado = EstadoVentanilla.PAUSA;
    const updatedVentanilla = await this.ventanillaRepository.save(ventanilla);

    return this.entityToDto(updatedVentanilla);
  }

  async reanudar(ventanillaId: number, usuarioId: number): Promise<VentanillaDto | null> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { id: ventanillaId },
    });

    if (!ventanilla) {
      return null;
    }

    if (ventanilla.estado !== EstadoVentanilla.PAUSA) {
      throw new Error('Solo se puede reanudar una ventanilla pausada');
    }

    // Verificar permisos usando el nuevo método
    const permisos = await this.puedeOperarVentanilla(ventanillaId, usuarioId);
    if (!permisos.puede_operar) {
      throw new Error(permisos.motivo || 'Sin permisos para reanudar esta ventanilla');
    }

    ventanilla.estado = EstadoVentanilla.ABIERTA;
    const updatedVentanilla = await this.ventanillaRepository.save(ventanilla);

    return this.entityToDto(updatedVentanilla);
  }

  async puedeAtender(ventanillaId: number): Promise<boolean> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { id: ventanillaId },
    });

    if (!ventanilla || !ventanilla.activa) {
      return false;
    }

    return ventanilla.estado === EstadoVentanilla.ABIERTA;
  }

  async getHistorial(ventanillaId: number, fechaInicio?: Date, fechaFin?: Date): Promise<{
    aperturas: AperturaVentanilla[];
    cierres: CierreVentanilla[];
  }> {
    const whereCondition: any = { ventanilla_id: ventanillaId };

    if (fechaInicio && fechaFin) {
      whereCondition.created_at = Between(fechaInicio, fechaFin);
    }

    const aperturas = await this.aperturaRepository.find({
      where: whereCondition,
      relations: ['usuario', 'montos_apertura'],
      order: { created_at: 'DESC' },
    });

    const cierres = await this.cierreRepository.find({
      where: whereCondition,
      relations: ['usuario', 'montos_cierre'],
      order: { created_at: 'DESC' },
    });

    return { aperturas, cierres };
  }

  async getAperturaActiva(ventanillaId: number): Promise<AperturaVentanilla | null> {
    return await this.aperturaRepository.findOne({
      where: { 
        ventanilla_id: ventanillaId,
        activa: true,
      },
      relations: ['montos_apertura'],
    });
  }

  async verificarDisponibilidadMontos(ventanillaId: number, monedaId: number, monto: number): Promise<boolean> {
    const aperturaActiva = await this.getAperturaActiva(ventanillaId);
    
    if (!aperturaActiva) {
      return false;
    }

    // Buscar el monto de apertura para esta moneda
    const montoApertura = await this.montoAperturaRepository.findOne({
      where: {
        apertura_ventanilla_id: aperturaActiva.id,
        moneda_id: monedaId,
      },
    });

    if (!montoApertura) {
      return false;
    }

    // Calcular montos utilizados en transacciones
    const montosUtilizados = await this.calcularMontosUtilizados(ventanillaId, monedaId, aperturaActiva.created_at);

    const disponible = montoApertura.monto - montosUtilizados;
    return disponible >= monto;
  }

  /**
   * Deletes a ventanilla after validation
   */
  async delete(id: number): Promise<boolean> {
    const transaccionesCount = await this.transaccionRepository.count({
      where: { ventanilla_id: id },
    });

    if (transaccionesCount > 0) {
      throw new Error('No se puede eliminar la ventanilla porque tiene transacciones asociadas');
    }

    const ventanilla = await this.ventanillaRepository.findOne({ where: { id } });
    if (ventanilla && ventanilla.estado !== EstadoVentanilla.CERRADA) {
      throw new Error('No se puede eliminar una ventanilla que no está cerrada');
    }

    const result = await this.ventanillaRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  private async calcularGananciaTotal(ventanillaId: number, fechaApertura: Date): Promise<number> {
    // Simplificado: sumar todas las ganancias de transacciones desde la apertura
    const transacciones = await this.transaccionRepository.find({
      where: {
        ventanilla_id: ventanillaId,
        created_at: Between(fechaApertura, new Date()),
      },
    });

    return transacciones.reduce((total, tx) => total + Number(tx.ganancia), 0);
  }

  private async calcularMontosUtilizados(ventanillaId: number, monedaId: number, fechaApertura: Date): Promise<number> {
    // Calcular montos utilizados en transacciones
    const transacciones = await this.transaccionRepository.find({
      where: {
        ventanilla_id: ventanillaId,
        moneda_destino_id: monedaId, // Moneda que se entregó
        created_at: Between(fechaApertura, new Date()),
      },
    });

    return transacciones.reduce((total, tx) => total + Number(tx.monto_destino), 0);
  }

  /**
   * Obtiene el resumen de cierre de ventanilla con montos esperados calculados automáticamente
   */
  async getResumenCierre(ventanillaId: number): Promise<CierreVentanillaResumenDto> {
    const aperturaActiva = await this.getAperturaActiva(ventanillaId);
    if (!aperturaActiva) {
      throw new Error('No hay apertura activa para esta ventanilla');
    }

    // Obtener los montos de apertura
    const montosApertura = await this.montoAperturaRepository.find({
      where: { apertura_ventanilla_id: aperturaActiva.id },
      relations: ['moneda'],
    });

    // Obtener transacciones realizadas desde la apertura
    const transacciones = await this.transaccionRepository.find({
      where: {
        ventanilla_id: ventanillaId,
        created_at: Between(aperturaActiva.fecha_apertura, new Date()),
      },
      relations: ['moneda_origen', 'moneda_destino'],
    });

    // Calcular montos esperados por moneda
    const montosEsperados = new Map<number, number>();
    
    // Inicializar con montos de apertura
    montosApertura.forEach(monto => {
      montosEsperados.set(monto.moneda_id, Number(monto.monto));
    });

    // Aplicar cambios por transacciones
    transacciones.forEach(transaccion => {
      const monedaOrigenId = transaccion.moneda_origen_id;
      const monedaDestinoId = transaccion.moneda_destino_id;
      const montoOrigen = Number(transaccion.monto_origen);
      const montoDestino = Number(transaccion.monto_destino);

      // La ventanilla recibe la moneda origen y entrega la moneda destino
      const currentOrigen = montosEsperados.get(monedaOrigenId) || 0;
      const currentDestino = montosEsperados.get(monedaDestinoId) || 0;
      
      montosEsperados.set(monedaOrigenId, currentOrigen + montoOrigen);
      montosEsperados.set(monedaDestinoId, currentDestino - montoDestino);
    });

    // Preparar montos esperados para el DTO
    const montosEsperadosDto: MontoCierreDto[] = montosApertura.map(apertura => {
      const montoEsperado = montosEsperados.get(apertura.moneda_id) || 0;
      
      return {
        moneda_id: apertura.moneda_id,
        moneda: {
          id: apertura.moneda.id,
          codigo: apertura.moneda.codigo,
          nombre: apertura.moneda.nombre,
          simbolo: apertura.moneda.simbolo,
        },
        monto: montoEsperado, // Este será el monto final calculado
        monto_esperado: montoEsperado,
        monto_fisico_real: undefined, // Se llenará en el frontend
        desfase_monto: 0,
        desfase_porcentaje: 0,
        confirmado_fisicamente: false,
        observaciones_desfase: undefined,
      };
    });

    // Calcular ganancia total
    const gananciaTotal = transacciones.reduce((total, tx) => total + Number(tx.ganancia), 0);

    return {
      apertura_ventanilla_id: aperturaActiva.id,
      montos_esperados: montosEsperadosDto,
      total_transacciones: transacciones.length,
      ganancia_total_calculada: gananciaTotal,
    };
  }

  /**
   * Procesa el cierre de ventanilla con validación física de montos
   */
  async procesarCierreVentanilla(
    ventanillaId: number, 
    usuarioId: number, 
    request: CierreVentanillaRequest
  ): Promise<boolean> {
    const aperturaActiva = await this.getAperturaActiva(ventanillaId);
    if (!aperturaActiva) {
      throw new Error('No hay apertura activa para esta ventanilla');
    }

    if (aperturaActiva.id !== request.apertura_ventanilla_id) {
      throw new Error('La apertura especificada no coincide con la apertura activa');
    }

    // Obtener resumen de cierre para validar montos esperados
    const resumenCierre = await this.getResumenCierre(ventanillaId);

    // Crear el cierre de ventanilla
    const cierre = this.cierreRepository.create({
      fecha_cierre: new Date(),
      hora_cierre: new Date().toTimeString().split(' ')[0],
      ganancia_total: resumenCierre.ganancia_total_calculada,
      observaciones_cierre: request.observaciones_cierre,
      ventanilla_id: ventanillaId,
      usuario_id: usuarioId,
      apertura_ventanilla_id: request.apertura_ventanilla_id,
    });

    const savedCierre = await this.cierreRepository.save(cierre);

    // Procesar cada monto de cierre
    for (const montoRequest of request.montos_cierre) {
      const montoEsperado = resumenCierre.montos_esperados.find(
        m => m.moneda_id === montoRequest.moneda_id
      );

      if (!montoEsperado) {
        throw new Error(`No se encontró monto esperado para la moneda ID ${montoRequest.moneda_id}`);
      }

      // Calcular desfase
      const desfaseMonto = montoRequest.monto_fisico_real - montoEsperado.monto_esperado;
      const desfasePorcentaje = montoEsperado.monto_esperado !== 0 
        ? Math.abs(desfaseMonto / montoEsperado.monto_esperado) * 100 
        : 0;

      // Crear registro de monto de cierre
      const montoCierre = this.montoCierreRepository.create({
        monto: montoRequest.monto_fisico_real, // Guardar el monto físico real como monto final
        monto_esperado: montoEsperado.monto_esperado,
        monto_fisico_real: montoRequest.monto_fisico_real,
        desfase_monto: desfaseMonto,
        desfase_porcentaje: desfasePorcentaje,
        confirmado_fisicamente: montoRequest.confirmado_fisicamente,
        observaciones_desfase: montoRequest.observaciones_desfase,
        cierre_ventanilla_id: savedCierre.id,
        moneda_id: montoRequest.moneda_id,
      });

      await this.montoCierreRepository.save(montoCierre);
    }

    // Marcar la apertura como inactiva
    aperturaActiva.activa = false;
    await this.aperturaRepository.save(aperturaActiva);

    // Cambiar estado de la ventanilla a CERRADA
    const ventanilla = await this.ventanillaRepository.findOne({ where: { id: ventanillaId } });
    if (ventanilla) {
      ventanilla.estado = EstadoVentanilla.CERRADA;
      await this.ventanillaRepository.save(ventanilla);
    }

    return true;
  }

  /**
   * Verifica que existan tipos de cambio configurados y activos para una casa de cambio
   */
  async verificarTiposCambioDisponibles(casaDeCambioId: number): Promise<any[]> {
    const tiposCambio = await this.tipoCambioRepository.find({
      where: { 
        casa_de_cambio_id: casaDeCambioId,
        activo: true 
      },
      relations: ['moneda_origen', 'moneda_destino'],
    });

    return tiposCambio.map(tipo => ({
      id: tipo.id,
      par_monedas: `${tipo.moneda_origen.codigo} → ${tipo.moneda_destino.codigo}`,
      tipo_compra: tipo.tipo_compra,
      tipo_venta: tipo.tipo_venta,
      moneda_origen: tipo.moneda_origen,
      moneda_destino: tipo.moneda_destino,
      activo: tipo.activo,
      created_at: tipo.created_at,
    }));
  }

  /**
   * Verifica si un usuario puede cerrar una ventanilla específica
   */
  async puedeOperarVentanilla(ventanillaId: number, usuarioId: number): Promise<{ puede_operar: boolean; es_admin: boolean; motivo?: string }> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { id: ventanillaId },
      relations: ['casa_de_cambio'],
    });

    if (!ventanilla) {
      return { puede_operar: false, es_admin: false, motivo: 'Ventanilla no encontrada' };
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return { puede_operar: false, es_admin: false, motivo: 'Usuario no encontrado' };
    }

    // Verificar si pertenece a la misma casa de cambio
    if (usuario.casa_de_cambio_id !== ventanilla.casa_de_cambio_id) {
      return { puede_operar: false, es_admin: false, motivo: 'Usuario no pertenece a esta casa de cambio' };
    }

    const esAdmin = usuario.rol === 'ADMINISTRADOR_MAESTRO' || usuario.rol === 'ADMINISTRADOR';
    
    // Si es admin, puede operar cualquier ventanilla de su casa
    if (esAdmin) {
      return { puede_operar: true, es_admin: true };
    }

    // Si es usuario de ventanilla, solo puede operar si él mismo la aperturó
    const aperturaActiva = await this.aperturaRepository.findOne({
      where: {
        ventanilla_id: ventanillaId,
        activa: true,
        usuario_id: usuarioId,
      },
    });

    if (aperturaActiva) {
      return { puede_operar: true, es_admin: false };
    }

    return { 
      puede_operar: false, 
      es_admin: false, 
      motivo: 'Solo puedes operar ventanillas que tú mismo aperturaste' 
    };
  }

  /**
   * Obtiene tipos de cambio disponibles para configurar en una ventanilla
   */
  async obtenerTiposCambioParaVentanilla(ventanillaId: number): Promise<any> {
    const ventanilla = await this.ventanillaRepository.findOne({
      where: { id: ventanillaId },
      relations: ['casa_de_cambio'],
    });

    if (!ventanilla) {
      throw new Error('Ventanilla no encontrada');
    }

    const tiposCambioDisponibles = await this.verificarTiposCambioDisponibles(ventanilla.casa_de_cambio_id);
    
    return {
      ventanilla: {
        id: ventanilla.id,
        nombre: ventanilla.nombre,
        casa_de_cambio: ventanilla.casa_de_cambio?.nombre,
      },
      tipos_cambio_disponibles: tiposCambioDisponibles,
      puede_aperturar: tiposCambioDisponibles.length > 0,
      mensaje: tiposCambioDisponibles.length === 0 
        ? 'No hay tipos de cambio configurados para esta casa de cambio' 
        : `${tiposCambioDisponibles.length} tipos de cambio disponibles`,
    };
  }

  /**
   * Auto-registra tipos de cambio con mantener_cambio_diario activado
   * para el día actual si no existen ya
   */
  private async autoRegistrarTiposCambioMantenidos(casaDeCambioId: number): Promise<void> {
    try {
      // Buscar tipos de cambio con mantener_cambio_diario = true
      const tiposCambioMantenidos = await this.tipoCambioRepository.find({
        where: { 
          casa_de_cambio_id: casaDeCambioId,
          mantener_cambio_diario: true
        },
        relations: ['moneda_origen', 'moneda_destino'],
        order: { updated_at: 'DESC' }
      });

      if (tiposCambioMantenidos.length === 0) {
        return; // No hay tipos con mantener_cambio_diario activado
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normalizar a inicio de día

      for (const tipoMantenido of tiposCambioMantenidos) {
        // Verificar si ya existe un tipo de cambio activo para este par hoy
        const existeHoy = await this.tipoCambioRepository.findOne({
          where: {
            casa_de_cambio_id: casaDeCambioId,
            moneda_origen_id: tipoMantenido.moneda_origen_id,
            moneda_destino_id: tipoMantenido.moneda_destino_id,
            activo: true,
            fecha_vigencia: hoy
          }
        });

        if (!existeHoy) {
          // Desactivar tipos de cambio anteriores para esta conversión
          await this.tipoCambioRepository.update(
            {
              casa_de_cambio_id: casaDeCambioId,
              moneda_origen_id: tipoMantenido.moneda_origen_id,
              moneda_destino_id: tipoMantenido.moneda_destino_id,
              activo: true,
            },
            { activo: false }
          );

          // Crear nuevo tipo de cambio para hoy con los mismos valores
          const nuevoTipoCambio = this.tipoCambioRepository.create({
            tipo_compra: tipoMantenido.tipo_compra,
            tipo_venta: tipoMantenido.tipo_venta,
            fecha_vigencia: hoy,
            mantener_cambio_diario: true,
            casa_de_cambio_id: casaDeCambioId,
            moneda_origen_id: tipoMantenido.moneda_origen_id,
            moneda_destino_id: tipoMantenido.moneda_destino_id,
            activo: true,
          });

          await this.tipoCambioRepository.save(nuevoTipoCambio);
        }
      }
    } catch (error) {
      // Log error pero no fallar la apertura
      console.error('Error al auto-registrar tipos de cambio mantenidos:', error);
    }
  }

  private entityToDto(entity: Ventanilla): VentanillaDto {
    return {
      id: entity.id,
      identificador: entity.identificador,
      nombre: entity.nombre,
      estado: entity.estado,
      activa: entity.activa,
      casa_de_cambio_id: entity.casa_de_cambio_id,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}