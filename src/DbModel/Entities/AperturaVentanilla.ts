import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ventanilla } from './Ventanilla';
import { Usuario } from './Usuario';
import { MontoApertura } from './MontoApertura';
import { CierreVentanilla } from './CierreVentanilla';

@Entity('aperturas_ventanilla')
export class AperturaVentanilla {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha_apertura: Date;

  @Column({ type: 'time' })
  hora_apertura: string;

  @Column({ type: 'text', nullable: true })
  observaciones_apertura: string;

  @Column({ type: 'boolean', default: true })
  activa: boolean; // false cuando la ventanilla se cierra

  // Relación con ventanilla
  @ManyToOne(() => Ventanilla, ventanilla => ventanilla.aperturas)
  @JoinColumn({ name: 'ventanilla_id' })
  ventanilla: Ventanilla;

  @Column({ name: 'ventanilla_id' })
  ventanilla_id: number;

  // Relación con usuario que apertura
  @ManyToOne(() => Usuario, usuario => usuario.aperturas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id' })
  usuario_id: number;

  // Relaciones
  @OneToMany(() => MontoApertura, monto => monto.apertura_ventanilla)
  montos_apertura: MontoApertura[];

  @OneToMany(() => CierreVentanilla, cierre => cierre.apertura_ventanilla)
  cierres: CierreVentanilla[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}