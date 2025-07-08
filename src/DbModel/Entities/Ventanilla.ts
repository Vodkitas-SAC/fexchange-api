import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EstadoVentanilla } from '../Enums';
import { CasaDeCambio } from './CasaDeCambio';
import { AperturaVentanilla } from './AperturaVentanilla';
import { CierreVentanilla } from './CierreVentanilla';
import { Transaccion } from './Transaccion';

@Entity('ventanillas')
export class Ventanilla {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  identificador: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: EstadoVentanilla,
    default: EstadoVentanilla.CERRADA,
  })
  estado: EstadoVentanilla;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  // Relación con casa de cambio
  @ManyToOne(() => CasaDeCambio, casa_cambio => casa_cambio.ventanillas)
  @JoinColumn({ name: 'casa_de_cambio_id' })
  casa_de_cambio: CasaDeCambio;

  @Column({ name: 'casa_de_cambio_id' })
  casa_de_cambio_id: number;

  // Relaciones
  @OneToMany(() => AperturaVentanilla, apertura => apertura.ventanilla)
  aperturas: AperturaVentanilla[];

  @OneToMany(() => CierreVentanilla, cierre => cierre.ventanilla)
  cierres: CierreVentanilla[];

  @OneToMany(() => Transaccion, transaccion => transaccion.ventanilla)
  transacciones: Transaccion[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}