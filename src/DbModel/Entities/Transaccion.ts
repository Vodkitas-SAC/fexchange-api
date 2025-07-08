import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EstadoTransaccion } from '../Enums';
import { Cliente } from './Cliente';
import { Ventanilla } from './Ventanilla';
import { Moneda } from './Moneda';
import { TipoCambio } from './TipoCambio';

@Entity('transacciones')
export class Transaccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero_transaccion: string;

  // Monto entregado por el cliente
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  monto_origen: number;

  // Monto entregado al cliente después de la conversión
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  monto_destino: number;

  // Tipo de cambio utilizado en la transacción
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  tipo_cambio_aplicado: number;

  // Ganancia obtenida en la transacción (en moneda maestra)
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  ganancia: number;

  @Column({
    type: 'enum',
    enum: EstadoTransaccion,
    default: EstadoTransaccion.COMPLETADA,
  })
  estado: EstadoTransaccion;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Relación con cliente (opcional para transacciones ocasionales)
  @ManyToOne(() => Cliente, cliente => cliente.transacciones, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'cliente_id', nullable: true })
  cliente_id: number;

  // Datos de cliente temporal para transacciones sin cliente registrado
  @Column({ type: 'jsonb', nullable: true })
  cliente_temporal: {
    nombres?: string;
    apellidos?: string;
    documento?: string;
    descripcion?: string;
  };

  // Relación con ventanilla
  @ManyToOne(() => Ventanilla, ventanilla => ventanilla.transacciones)
  @JoinColumn({ name: 'ventanilla_id' })
  ventanilla: Ventanilla;

  @Column({ name: 'ventanilla_id' })
  ventanilla_id: number;

  // Relación con moneda origen
  @ManyToOne(() => Moneda)
  @JoinColumn({ name: 'moneda_origen_id' })
  moneda_origen: Moneda;

  @Column({ name: 'moneda_origen_id' })
  moneda_origen_id: number;

  // Relación con moneda destino
  @ManyToOne(() => Moneda)
  @JoinColumn({ name: 'moneda_destino_id' })
  moneda_destino: Moneda;

  @Column({ name: 'moneda_destino_id' })
  moneda_destino_id: number;

  // Relación con tipo de cambio usado
  @ManyToOne(() => TipoCambio)
  @JoinColumn({ name: 'tipo_cambio_id' })
  tipo_cambio: TipoCambio;

  @Column({ name: 'tipo_cambio_id' })
  tipo_cambio_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}