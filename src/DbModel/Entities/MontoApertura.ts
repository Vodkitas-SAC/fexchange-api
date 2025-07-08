import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AperturaVentanilla } from './AperturaVentanilla';
import { Moneda } from './Moneda';

@Entity('montos_apertura')
export class MontoApertura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  monto: number;

  // Relación con apertura de ventanilla
  @ManyToOne(() => AperturaVentanilla, apertura => apertura.montos_apertura)
  @JoinColumn({ name: 'apertura_ventanilla_id' })
  apertura_ventanilla: AperturaVentanilla;

  @Column({ name: 'apertura_ventanilla_id' })
  apertura_ventanilla_id: number;

  // Relación con moneda
  @ManyToOne(() => Moneda, moneda => moneda.montos_apertura)
  @JoinColumn({ name: 'moneda_id' })
  moneda: Moneda;

  @Column({ name: 'moneda_id' })
  moneda_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}