import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TipoCambio } from './TipoCambio';
import { MontoApertura } from './MontoApertura';
import { MontoCierre } from './MontoCierre';

@Entity('monedas')
export class Moneda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  codigo: string; // USD, PEN, EUR, etc.

  @Column({ type: 'varchar', length: 100 })
  nombre: string; // Dólar Americano, Sol Peruano, etc.

  @Column({ type: 'varchar', length: 10 })
  simbolo: string; // $, S/, €, etc.

  @Column({ type: 'int', default: 2 })
  decimales: number; // Cantidad de decimales para la moneda

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  // Relaciones
  @OneToMany(() => TipoCambio, tipo_cambio => tipo_cambio.moneda_origen)
  tipos_cambio_origen: TipoCambio[];

  @OneToMany(() => TipoCambio, tipo_cambio => tipo_cambio.moneda_destino)
  tipos_cambio_destino: TipoCambio[];

  @OneToMany(() => MontoApertura, monto => monto.moneda)
  montos_apertura: MontoApertura[];

  @OneToMany(() => MontoCierre, monto => monto.moneda)
  montos_cierre: MontoCierre[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}