import { Repository } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { Transaccion } from '../../DbModel/Entities/Transaccion';
import { CasaDeCambio } from '../../DbModel/Entities/CasaDeCambio';
import { Ventanilla } from '../../DbModel/Entities/Ventanilla';
import { Cliente } from '../../DbModel/Entities/Cliente';
import { IReporteService } from '../IReporteService';
import { GenerarReporteGananciasRequest, ReporteTransaccionesRequest } from '../../Models/Reporte/ReporteRequestParams';
import { ReporteGananciasDto, ResumenTransaccionesDto, ReporteDiarioDto, ReporteVentanillaDto, ReporteMonedaDto } from '../../Models/Reporte/ReporteDto';
import { TipoReporte, EstadoTransaccion, TipoCliente } from '../../DbModel/Enums';

export class ReporteService implements IReporteService {
  private transaccionRepository: Repository<Transaccion>;
  private casaDeCambioRepository: Repository<CasaDeCambio>;
  private ventanillaRepository: Repository<Ventanilla>;
  private clienteRepository: Repository<Cliente>;

  constructor() {
    this.transaccionRepository = AppDataSource.getRepository(Transaccion);
    this.casaDeCambioRepository = AppDataSource.getRepository(CasaDeCambio);
    this.ventanillaRepository = AppDataSource.getRepository(Ventanilla);
    this.clienteRepository = AppDataSource.getRepository(Cliente);
  }

  async generarReporteGanancias(request: GenerarReporteGananciasRequest): Promise<ReporteGananciasDto> {
    const fechaInicio = new Date(request.fecha_inicio);
    const fechaFin = request.fecha_fin ? new Date(request.fecha_fin) : this.calcularFechaFin(fechaInicio, request.tipo);

    // Validar casa de cambio
    const casaDeCambio = await this.casaDeCambioRepository.findOne({
      where: { id: request.casa_de_cambio_id },
    });
    if (!casaDeCambio) {
      throw new Error('Casa de cambio no encontrada');
    }

    // Construir query base
    const queryBuilder = this.transaccionRepository
      .createQueryBuilder('transaccion')
      .leftJoinAndSelect('transaccion.ventanilla', 'ventanilla')
      .leftJoinAndSelect('transaccion.moneda_origen', 'moneda_origen')
      .leftJoinAndSelect('transaccion.moneda_destino', 'moneda_destino')
      .where('ventanilla.casa_de_cambio_id = :casaDeCambioId', { casaDeCambioId: request.casa_de_cambio_id })
      .andWhere('transaccion.estado = :estado', { estado: EstadoTransaccion.COMPLETADA })
      .andWhere('transaccion.created_at >= :fechaInicio', { fechaInicio })
      .andWhere('transaccion.created_at <= :fechaFin', { fechaFin });

    if (request.ventanilla_id) {
      queryBuilder.andWhere('transaccion.ventanilla_id = :ventanillaId', { ventanillaId: request.ventanilla_id });
    }

    const transacciones = await queryBuilder.getMany();

    // Calcular totales
    const gananciaTotal = transacciones.reduce((sum, t) => sum + parseFloat(t.ganancia.toString()), 0);
    const montoTotalOperado = transacciones.reduce((sum, t) => sum + parseFloat(t.monto_origen.toString()), 0);

    // Generar reporte por ventanillas
    const ventanillas = await this.getReportePorVentanillas(
      request.casa_de_cambio_id,
      fechaInicio,
      fechaFin,
      request.ventanilla_id
    );

    // Generar reporte por monedas
    const monedas = await this.getReportePorMonedas(
      request.casa_de_cambio_id,
      fechaInicio,
      fechaFin,
      request.ventanilla_id
    );

    // Generar datos por día
    let transaccionesPorDia: ReporteDiarioDto[] = [];
    switch (request.tipo) {
      case TipoReporte.DIARIO:
        transaccionesPorDia = await this.getGananciasPorDia(fechaInicio, fechaFin, request.casa_de_cambio_id, request.ventanilla_id);
        break;
      case TipoReporte.SEMANAL:
        transaccionesPorDia = await this.getGananciasPorSemana(fechaInicio, fechaFin, request.casa_de_cambio_id, request.ventanilla_id);
        break;
      case TipoReporte.MENSUAL:
        transaccionesPorDia = await this.getGananciasPorMes(fechaInicio, fechaFin, request.casa_de_cambio_id, request.ventanilla_id);
        break;
      case TipoReporte.ANUAL:
        transaccionesPorDia = await this.getGananciasPorAno(fechaInicio, fechaFin, request.casa_de_cambio_id, request.ventanilla_id);
        break;
    }

    return {
      tipo: request.tipo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      ganancia_total: Math.round(gananciaTotal * 100) / 100,
      total_transacciones: transacciones.length,
      monto_total_operado: Math.round(montoTotalOperado * 100) / 100,
      casa_de_cambio_id: request.casa_de_cambio_id,
      ventanilla_id: request.ventanilla_id,
      ventanillas,
      monedas,
      transacciones_por_dia: transaccionesPorDia,
      created_at: new Date(),
    };
  }

  async getGananciasPorDia(
    fechaInicio: Date,
    fechaFin: Date,
    casaDeCambioId: number,
    ventanillaId?: number
  ): Promise<ReporteDiarioDto[]> {
    let query = `
      SELECT 
        DATE(t.created_at) as fecha,
        SUM(t.ganancia) as ganancia,
        COUNT(*) as total_transacciones,
        SUM(t.monto_origen) as monto_operado
      FROM transacciones t
      INNER JOIN ventanillas v ON t.ventanilla_id = v.id
      WHERE v.casa_de_cambio_id = $1
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
    `;

    const params: any[] = [casaDeCambioId, EstadoTransaccion.COMPLETADA, fechaInicio, fechaFin];

    if (ventanillaId) {
      query += ' AND t.ventanilla_id = $5';
      params.push(ventanillaId);
    }

    query += ' GROUP BY DATE(t.created_at) ORDER BY fecha ASC';

    const result = await AppDataSource.query(query, params);

    return result.map((row: any) => ({
      fecha: new Date(row.fecha),
      ganancia: Math.round(parseFloat(row.ganancia) * 100) / 100,
      total_transacciones: parseInt(row.total_transacciones),
      monto_operado: Math.round(parseFloat(row.monto_operado) * 100) / 100,
    }));
  }

  async getGananciasPorSemana(
    fechaInicio: Date,
    fechaFin: Date,
    casaDeCambioId: number,
    ventanillaId?: number
  ): Promise<ReporteDiarioDto[]> {
    let query = `
      SELECT 
        DATE_TRUNC('week', t.created_at) as fecha,
        SUM(t.ganancia) as ganancia,
        COUNT(*) as total_transacciones,
        SUM(t.monto_origen) as monto_operado
      FROM transacciones t
      INNER JOIN ventanillas v ON t.ventanilla_id = v.id
      WHERE v.casa_de_cambio_id = $1
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
    `;

    const params: any[] = [casaDeCambioId, EstadoTransaccion.COMPLETADA, fechaInicio, fechaFin];

    if (ventanillaId) {
      query += ' AND t.ventanilla_id = $5';
      params.push(ventanillaId);
    }

    query += ' GROUP BY DATE_TRUNC(\'week\', t.created_at) ORDER BY fecha ASC';

    const result = await AppDataSource.query(query, params);

    return result.map((row: any) => ({
      fecha: new Date(row.fecha),
      ganancia: Math.round(parseFloat(row.ganancia) * 100) / 100,
      total_transacciones: parseInt(row.total_transacciones),
      monto_operado: Math.round(parseFloat(row.monto_operado) * 100) / 100,
    }));
  }

  async getGananciasPorMes(
    fechaInicio: Date,
    fechaFin: Date,
    casaDeCambioId: number,
    ventanillaId?: number
  ): Promise<ReporteDiarioDto[]> {
    let query = `
      SELECT 
        DATE_TRUNC('month', t.created_at) as fecha,
        SUM(t.ganancia) as ganancia,
        COUNT(*) as total_transacciones,
        SUM(t.monto_origen) as monto_operado
      FROM transacciones t
      INNER JOIN ventanillas v ON t.ventanilla_id = v.id
      WHERE v.casa_de_cambio_id = $1
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
    `;

    const params: any[] = [casaDeCambioId, EstadoTransaccion.COMPLETADA, fechaInicio, fechaFin];

    if (ventanillaId) {
      query += ' AND t.ventanilla_id = $5';
      params.push(ventanillaId);
    }

    query += ' GROUP BY DATE_TRUNC(\'month\', t.created_at) ORDER BY fecha ASC';

    const result = await AppDataSource.query(query, params);

    return result.map((row: any) => ({
      fecha: new Date(row.fecha),
      ganancia: Math.round(parseFloat(row.ganancia) * 100) / 100,
      total_transacciones: parseInt(row.total_transacciones),
      monto_operado: Math.round(parseFloat(row.monto_operado) * 100) / 100,
    }));
  }

  async getGananciasPorAno(
    fechaInicio: Date,
    fechaFin: Date,
    casaDeCambioId: number,
    ventanillaId?: number
  ): Promise<ReporteDiarioDto[]> {
    let query = `
      SELECT 
        DATE_TRUNC('year', t.created_at) as fecha,
        SUM(t.ganancia) as ganancia,
        COUNT(*) as total_transacciones,
        SUM(t.monto_origen) as monto_operado
      FROM transacciones t
      INNER JOIN ventanillas v ON t.ventanilla_id = v.id
      WHERE v.casa_de_cambio_id = $1
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
    `;

    const params: any[] = [casaDeCambioId, EstadoTransaccion.COMPLETADA, fechaInicio, fechaFin];

    if (ventanillaId) {
      query += ' AND t.ventanilla_id = $5';
      params.push(ventanillaId);
    }

    query += ' GROUP BY DATE_TRUNC(\'year\', t.created_at) ORDER BY fecha ASC';

    const result = await AppDataSource.query(query, params);

    return result.map((row: any) => ({
      fecha: new Date(row.fecha),
      ganancia: Math.round(parseFloat(row.ganancia) * 100) / 100,
      total_transacciones: parseInt(row.total_transacciones),
      monto_operado: Math.round(parseFloat(row.monto_operado) * 100) / 100,
    }));
  }

  async getResumenTransacciones(request: ReporteTransaccionesRequest): Promise<ResumenTransaccionesDto> {
    const fechaInicio = new Date(request.fecha_inicio);
    const fechaFin = new Date(request.fecha_fin);

    let queryBuilder = this.transaccionRepository
      .createQueryBuilder('transaccion')
      .leftJoin('transaccion.ventanilla', 'ventanilla')
      .where('transaccion.created_at >= :fechaInicio', { fechaInicio })
      .andWhere('transaccion.created_at <= :fechaFin', { fechaFin });

    if (request.casa_de_cambio_id) {
      queryBuilder.andWhere('ventanilla.casa_de_cambio_id = :casaDeCambioId', { 
        casaDeCambioId: request.casa_de_cambio_id 
      });
    }

    if (request.ventanilla_id) {
      queryBuilder.andWhere('transaccion.ventanilla_id = :ventanillaId', { 
        ventanillaId: request.ventanilla_id 
      });
    }

    if (request.cliente_id) {
      queryBuilder.andWhere('transaccion.cliente_id = :clienteId', { 
        clienteId: request.cliente_id 
      });
    }

    const transacciones = await queryBuilder.getMany();

    const completadas = transacciones.filter(t => t.estado === EstadoTransaccion.COMPLETADA);
    const canceladas = transacciones.filter(t => t.estado === EstadoTransaccion.CANCELADA);
    const pendientes = transacciones.filter(t => t.estado === EstadoTransaccion.PENDIENTE);

    const montoTotalCompletadas = completadas.reduce((sum, t) => sum + parseFloat(t.monto_origen.toString()), 0);
    const gananciaTotal = completadas.reduce((sum, t) => sum + parseFloat(t.ganancia.toString()), 0);

    // Obtener transacciones más grandes
    const transaccionesMasGrandes = completadas
      .sort((a, b) => parseFloat(b.ganancia.toString()) - parseFloat(a.ganancia.toString()))
      .slice(0, request.limit || 10)
      .map(t => ({
        numero_transaccion: t.numero_transaccion,
        monto_origen: parseFloat(t.monto_origen.toString()),
        monto_destino: parseFloat(t.monto_destino.toString()),
        ganancia: parseFloat(t.ganancia.toString()),
        fecha: t.created_at,
      }));

    return {
      total_completadas: completadas.length,
      total_canceladas: canceladas.length,
      total_pendientes: pendientes.length,
      monto_total_completadas: Math.round(montoTotalCompletadas * 100) / 100,
      ganancia_total: Math.round(gananciaTotal * 100) / 100,
      transacciones_mas_grandes: transaccionesMasGrandes,
    };
  }

  async getTransaccionesMasRentables(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date,
    limit = 10
  ): Promise<any[]> {
    const query = `
      SELECT 
        t.numero_transaccion,
        t.monto_origen,
        t.monto_destino,
        t.ganancia,
        t.created_at,
        mo.codigo as moneda_origen,
        md.codigo as moneda_destino,
        v.nombre as ventanilla,
        c.descripcion as cliente
      FROM transacciones t
      INNER JOIN ventanillas v ON t.ventanilla_id = v.id
      INNER JOIN monedas mo ON t.moneda_origen_id = mo.id
      INNER JOIN monedas md ON t.moneda_destino_id = md.id
      INNER JOIN clientes c ON t.cliente_id = c.id
      WHERE v.casa_de_cambio_id = $1
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
      ORDER BY t.ganancia DESC
      LIMIT $5
    `;

    return AppDataSource.query(query, [
      casaDeCambioId,
      EstadoTransaccion.COMPLETADA,
      fechaInicio,
      fechaFin,
      limit,
    ]);
  }

  async getRendimientoPorVentanilla(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]> {
    const query = `
      SELECT 
        v.id,
        v.nombre,
        COUNT(t.id) as total_transacciones,
        SUM(t.ganancia) as ganancia_total,
        SUM(t.monto_origen) as monto_operado,
        AVG(t.ganancia) as ganancia_promedio
      FROM ventanillas v
      LEFT JOIN transacciones t ON v.id = t.ventanilla_id 
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
      WHERE v.casa_de_cambio_id = $1
      GROUP BY v.id, v.nombre
      ORDER BY ganancia_total DESC
    `;

    return AppDataSource.query(query, [
      casaDeCambioId,
      EstadoTransaccion.COMPLETADA,
      fechaInicio,
      fechaFin,
    ]);
  }

  async getEstadisticasPorMoneda(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]> {
    const query = `
      SELECT 
        m.codigo,
        m.nombre,
        COUNT(CASE WHEN t.moneda_origen_id = m.id THEN 1 END) as veces_origen,
        COUNT(CASE WHEN t.moneda_destino_id = m.id THEN 1 END) as veces_destino,
        SUM(CASE WHEN t.moneda_origen_id = m.id THEN t.monto_origen ELSE 0 END) as monto_total_origen,
        SUM(CASE WHEN t.moneda_destino_id = m.id THEN t.monto_destino ELSE 0 END) as monto_total_destino
      FROM monedas m
      LEFT JOIN transacciones t ON (m.id = t.moneda_origen_id OR m.id = t.moneda_destino_id)
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
      LEFT JOIN ventanillas v ON t.ventanilla_id = v.id
      WHERE v.casa_de_cambio_id = $1 OR v.casa_de_cambio_id IS NULL
      GROUP BY m.id, m.codigo, m.nombre
      HAVING COUNT(CASE WHEN t.moneda_origen_id = m.id THEN 1 END) > 0 
          OR COUNT(CASE WHEN t.moneda_destino_id = m.id THEN 1 END) > 0
      ORDER BY (veces_origen + veces_destino) DESC
    `;

    return AppDataSource.query(query, [
      casaDeCambioId,
      EstadoTransaccion.COMPLETADA,
      fechaInicio,
      fechaFin,
    ]);
  }

  async generarReporteSBS(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<{
    transacciones: any[];
    resumen: {
      total_operaciones: number;
      monto_total: number;
      clientes_registrados: number;
      clientes_no_registrados: number;
    };
  }> {
    // Obtener transacciones con datos SBS
    const queryTransacciones = `
      SELECT 
        t.numero_transaccion,
        t.monto_origen,
        t.monto_destino,
        t.ganancia,
        t.created_at,
        mo.codigo as moneda_origen,
        md.codigo as moneda_destino,
        c.tipo as tipo_cliente,
        c.descripcion as cliente_descripcion,
        c.ruc as cliente_ruc,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.tipo_documento,
        p.numero_documento,
        p.nacionalidad,
        p.ocupacion,
        v.nombre as ventanilla
      FROM transacciones t
      INNER JOIN ventanillas v ON t.ventanilla_id = v.id
      INNER JOIN monedas mo ON t.moneda_origen_id = mo.id
      INNER JOIN monedas md ON t.moneda_destino_id = md.id
      INNER JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN personas p ON c.persona_id = p.id
      WHERE v.casa_de_cambio_id = $1
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
      ORDER BY t.created_at DESC
    `;

    const transacciones = await AppDataSource.query(queryTransacciones, [
      casaDeCambioId,
      EstadoTransaccion.COMPLETADA,
      fechaInicio,
      fechaFin,
    ]);

    // Calcular resumen
    const totalOperaciones = transacciones.length;
    const montoTotal = transacciones.reduce((sum: number, t: any) => sum + parseFloat(t.monto_origen), 0);
    const clientesRegistrados = transacciones.filter((t: any) => t.tipo_cliente === TipoCliente.REGISTRADO).length;
    const clientesNoRegistrados = transacciones.filter((t: any) => t.tipo_cliente === TipoCliente.OCASIONAL).length;

    return {
      transacciones,
      resumen: {
        total_operaciones: totalOperaciones,
        monto_total: Math.round(montoTotal * 100) / 100,
        clientes_registrados: clientesRegistrados,
        clientes_no_registrados: clientesNoRegistrados,
      },
    };
  }

  // Métodos auxiliares privados
  private calcularFechaFin(fechaInicio: Date, tipo: TipoReporte): Date {
    const fecha = new Date(fechaInicio);
    
    switch (tipo) {
      case TipoReporte.DIARIO:
        fecha.setDate(fecha.getDate() + 1);
        break;
      case TipoReporte.SEMANAL:
        fecha.setDate(fecha.getDate() + 7);
        break;
      case TipoReporte.MENSUAL:
        fecha.setMonth(fecha.getMonth() + 1);
        break;
      case TipoReporte.ANUAL:
        fecha.setFullYear(fecha.getFullYear() + 1);
        break;
    }
    
    return fecha;
  }

  private async getReportePorVentanillas(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date,
    ventanillaId?: number
  ): Promise<ReporteVentanillaDto[]> {
    let query = `
      SELECT 
        v.id as ventanilla_id,
        v.nombre as ventanilla_nombre,
        COALESCE(SUM(t.ganancia), 0) as ganancia,
        COALESCE(COUNT(t.id), 0) as total_transacciones,
        COALESCE(SUM(t.monto_origen), 0) as monto_operado
      FROM ventanillas v
      LEFT JOIN transacciones t ON v.id = t.ventanilla_id 
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
      WHERE v.casa_de_cambio_id = $1
    `;

    const params: any[] = [casaDeCambioId, EstadoTransaccion.COMPLETADA, fechaInicio, fechaFin];

    if (ventanillaId) {
      query += ' AND v.id = $5';
      params.push(ventanillaId);
    }

    query += ' GROUP BY v.id, v.nombre ORDER BY ganancia DESC';

    const result = await AppDataSource.query(query, params);

    return result.map((row: any) => ({
      ventanilla_id: row.ventanilla_id,
      ventanilla_nombre: row.ventanilla_nombre,
      ganancia: Math.round(parseFloat(row.ganancia) * 100) / 100,
      total_transacciones: parseInt(row.total_transacciones),
      monto_operado: Math.round(parseFloat(row.monto_operado) * 100) / 100,
    }));
  }

  private async getReportePorMonedas(
    casaDeCambioId: number,
    fechaInicio: Date,
    fechaFin: Date,
    ventanillaId?: number
  ): Promise<ReporteMonedaDto[]> {
    let query = `
      SELECT 
        m.id as moneda_id,
        m.codigo as moneda_codigo,
        m.nombre as moneda_nombre,
        COALESCE(SUM(CASE WHEN t.moneda_origen_id = m.id THEN t.monto_origen ELSE 0 END), 0) as monto_origen,
        COALESCE(SUM(CASE WHEN t.moneda_destino_id = m.id THEN t.monto_destino ELSE 0 END), 0) as monto_destino,
        COALESCE(SUM(t.ganancia), 0) as ganancia,
        COALESCE(COUNT(t.id), 0) as total_transacciones
      FROM monedas m
      LEFT JOIN transacciones t ON (m.id = t.moneda_origen_id OR m.id = t.moneda_destino_id)
        AND t.estado = $2
        AND t.created_at >= $3
        AND t.created_at <= $4
      LEFT JOIN ventanillas v ON t.ventanilla_id = v.id
      WHERE (v.casa_de_cambio_id = $1 OR v.casa_de_cambio_id IS NULL)
    `;

    const params: any[] = [casaDeCambioId, EstadoTransaccion.COMPLETADA, fechaInicio, fechaFin];

    if (ventanillaId) {
      query += ' AND (t.ventanilla_id = $5 OR t.ventanilla_id IS NULL)';
      params.push(ventanillaId);
    }

    query += ` 
      GROUP BY m.id, m.codigo, m.nombre
      HAVING COUNT(t.id) > 0
      ORDER BY ganancia DESC
    `;

    const result = await AppDataSource.query(query, params);

    return result.map((row: any) => ({
      moneda_id: row.moneda_id,
      moneda_codigo: row.moneda_codigo,
      moneda_nombre: row.moneda_nombre,
      monto_origen: Math.round(parseFloat(row.monto_origen) * 100) / 100,
      monto_destino: Math.round(parseFloat(row.monto_destino) * 100) / 100,
      ganancia: Math.round(parseFloat(row.ganancia) * 100) / 100,
      total_transacciones: parseInt(row.total_transacciones),
    }));
  }
}