import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ventanilla } from './Ventanilla';
import { Usuario } from './Usuario';
import { AperturaVentanilla } from './AperturaVentanilla';
import { MontoCierre } from './MontoCierre';

@Entity('cierres_ventanilla')
export class CierreVentanilla {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha_cierre: Date;

  @Column({ type: 'time' })
  hora_cierre: string;

  // Ganancia total obtenida en la ventanilla (en moneda maestra)
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  ganancia_total: number;

  @Column({ type: 'text', nullable: true })
  observaciones_cierre: string;

  // Relación con ventanilla
  @ManyToOne(() => Ventanilla, ventanilla => ventanilla.cierres)
  @JoinColumn({ name: 'ventanilla_id' })
  ventanilla: Ventanilla;

  @Column({ name: 'ventanilla_id' })
  ventanilla_id: number;

  // Relación con usuario que cierra (debe ser el mismo que aperturó)
  @ManyToOne(() => Usuario, usuario => usuario.cierres)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id' })
  usuario_id: number;

  // Relación con la apertura correspondiente
  @ManyToOne(() => AperturaVentanilla, apertura => apertura.cierres)
  @JoinColumn({ name: 'apertura_ventanilla_id' })
  apertura_ventanilla: AperturaVentanilla;

  @Column({ name: 'apertura_ventanilla_id' })
  apertura_ventanilla_id: number;

  // Relaciones
  @OneToMany(() => MontoCierre, monto => monto.cierre_ventanilla)
  montos_cierre: MontoCierre[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}