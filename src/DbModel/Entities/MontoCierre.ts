import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CierreVentanilla } from './CierreVentanilla';
import { Moneda } from './Moneda';

@Entity('montos_cierre')
export class MontoCierre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  monto: number;

  // Monto esperado calculado automáticamente (apertura + transacciones)
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  monto_esperado: number;

  // Monto físico real contado en caja
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  monto_fisico_real: number;

  // Diferencia entre esperado y real
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  desfase_monto: number;

  // Porcentaje de desfase
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  desfase_porcentaje: number;

  // Si el monto físico fue confirmado por el operador
  @Column({ type: 'boolean', default: false })
  confirmado_fisicamente: boolean;

  // Observaciones sobre el desfase
  @Column({ type: 'text', nullable: true })
  observaciones_desfase: string;

  // Relación con cierre de ventanilla
  @ManyToOne(() => CierreVentanilla, cierre => cierre.montos_cierre)
  @JoinColumn({ name: 'cierre_ventanilla_id' })
  cierre_ventanilla: CierreVentanilla;

  @Column({ name: 'cierre_ventanilla_id' })
  cierre_ventanilla_id: number;

  // Relación con moneda
  @ManyToOne(() => Moneda, moneda => moneda.montos_cierre)
  @JoinColumn({ name: 'moneda_id' })
  moneda: Moneda;

  @Column({ name: 'moneda_id' })
  moneda_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}