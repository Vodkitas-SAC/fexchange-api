import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TipoCambio } from './TipoCambio';
import { Usuario } from './Usuario';

/**
 * Entidad de Auditoría de Tipos de Cambio
 * 
 * Registra todos los cambios realizados en los tipos de cambio,
 * proporcionando un historial completo de modificaciones con:
 * - Usuario responsable del cambio
 * - Valores anteriores y nuevos
 * - Timestamp del cambio
 * - Información adicional de contexto
 */

export enum AccionAuditoria {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
}

@Entity('auditoria_tipos_cambio')
@Index(['tipo_cambio_id', 'created_at'])
@Index(['usuario_id'])
@Index(['accion'])
export class AuditoriaTipoCambio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  tipo_cambio_id: number;

  @Column()
  @Index()
  usuario_id: number;

  @Column({
    type: 'enum',
    enum: AccionAuditoria,
  })
  @Index()
  accion: AccionAuditoria;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Valores antes del cambio (JSON)',
  })
  valores_anteriores: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Valores después del cambio (JSON)',
  })
  valores_nuevos: Record<string, any> | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Motivo del cambio',
  })
  motivo: string | null;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP del usuario que realizó el cambio',
  })
  ip_usuario: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'User agent del navegador',
  })
  user_agent: string | null;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => TipoCambio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tipo_cambio_id' })
  tipo_cambio: TipoCambio;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  /**
   * Crea un registro de auditoría para la creación de un tipo de cambio
   */
  static paraCreacion(
    tipoCambioId: number,
    usuarioId: number,
    valoresNuevos: Record<string, any>,
    contexto?: { ip?: string; userAgent?: string; motivo?: string }
  ): Partial<AuditoriaTipoCambio> {
    return {
      tipo_cambio_id: tipoCambioId,
      usuario_id: usuarioId,
      accion: AccionAuditoria.CREATE,
      valores_anteriores: null,
      valores_nuevos: valoresNuevos,
      motivo: contexto?.motivo || 'Creación de nuevo tipo de cambio',
      ip_usuario: contexto?.ip,
      user_agent: contexto?.userAgent,
    };
  }

  /**
   * Crea un registro de auditoría para la actualización de un tipo de cambio
   */
  static paraActualizacion(
    tipoCambioId: number,
    usuarioId: number,
    valoresAnteriores: Record<string, any>,
    valoresNuevos: Record<string, any>,
    contexto?: { ip?: string; userAgent?: string; motivo?: string }
  ): Partial<AuditoriaTipoCambio> {
    return {
      tipo_cambio_id: tipoCambioId,
      usuario_id: usuarioId,
      accion: AccionAuditoria.UPDATE,
      valores_anteriores: valoresAnteriores,
      valores_nuevos: valoresNuevos,
      motivo: contexto?.motivo || 'Actualización de tipo de cambio',
      ip_usuario: contexto?.ip,
      user_agent: contexto?.userAgent,
    };
  }

  /**
   * Crea un registro de auditoría para la activación/desactivación
   */
  static paraActivacion(
    tipoCambioId: number,
    usuarioId: number,
    activar: boolean,
    contexto?: { ip?: string; userAgent?: string; motivo?: string }
  ): Partial<AuditoriaTipoCambio> {
    return {
      tipo_cambio_id: tipoCambioId,
      usuario_id: usuarioId,
      accion: activar ? AccionAuditoria.ACTIVATE : AccionAuditoria.DEACTIVATE,
      valores_anteriores: { activo: !activar },
      valores_nuevos: { activo: activar },
      motivo: contexto?.motivo || (activar ? 'Activación de tipo de cambio' : 'Desactivación de tipo de cambio'),
      ip_usuario: contexto?.ip,
      user_agent: contexto?.userAgent,
    };
  }

  /**
   * Crea un registro de auditoría para la eliminación
   */
  static paraEliminacion(
    tipoCambioId: number,
    usuarioId: number,
    valoresAnteriores: Record<string, any>,
    contexto?: { ip?: string; userAgent?: string; motivo?: string }
  ): Partial<AuditoriaTipoCambio> {
    return {
      tipo_cambio_id: tipoCambioId,
      usuario_id: usuarioId,
      accion: AccionAuditoria.DELETE,
      valores_anteriores: valoresAnteriores,
      valores_nuevos: null,
      motivo: contexto?.motivo || 'Eliminación de tipo de cambio',
      ip_usuario: contexto?.ip,
      user_agent: contexto?.userAgent,
    };
  }
}