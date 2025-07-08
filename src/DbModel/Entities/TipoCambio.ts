import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CasaDeCambio } from './CasaDeCambio';
import { Moneda } from './Moneda';

@Entity('tipos_cambio')
export class TipoCambio {
  @PrimaryGeneratedColumn()
  id: number;

  // Tipo de cambio de compra (cuánto paga la casa de cambio por la moneda origen)
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  tipo_compra: number;

  // Tipo de cambio de venta (cuánto cobra la casa de cambio por la moneda destino)
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  tipo_venta: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_vigencia: Date;

  @Column({ type: 'boolean', default: false })
  mantener_cambio_diario: boolean;

  // Relación con casa de cambio
  @ManyToOne(() => CasaDeCambio, casa_cambio => casa_cambio.tipos_cambio)
  @JoinColumn({ name: 'casa_de_cambio_id' })
  casa_de_cambio: CasaDeCambio;

  @Column({ name: 'casa_de_cambio_id' })
  casa_de_cambio_id: number;

  // Relación con moneda origen
  @ManyToOne(() => Moneda, moneda => moneda.tipos_cambio_origen)
  @JoinColumn({ name: 'moneda_origen_id' })
  moneda_origen: Moneda;

  @Column({ name: 'moneda_origen_id' })
  moneda_origen_id: number;

  // Relación con moneda destino
  @ManyToOne(() => Moneda, moneda => moneda.tipos_cambio_destino)
  @JoinColumn({ name: 'moneda_destino_id' })
  moneda_destino: Moneda;

  @Column({ name: 'moneda_destino_id' })
  moneda_destino_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}