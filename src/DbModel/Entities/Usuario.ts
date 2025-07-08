import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RolUsuario } from '../Enums';
import { CasaDeCambio } from './CasaDeCambio';
import { Persona } from './Persona';
import { AperturaVentanilla } from './AperturaVentanilla';
import { CierreVentanilla } from './CierreVentanilla';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.ENCARGADO_VENTANILLA,
  })
  rol: RolUsuario;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // Relación con persona
  @ManyToOne(() => Persona, { nullable: false })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ name: 'persona_id' })
  persona_id: number;

  // Relación con casa de cambio
  @ManyToOne(() => CasaDeCambio, casa_cambio => casa_cambio.usuarios)
  @JoinColumn({ name: 'casa_de_cambio_id' })
  casa_de_cambio: CasaDeCambio;

  @Column({ name: 'casa_de_cambio_id' })
  casa_de_cambio_id: number;

  // Relaciones
  @OneToMany(() => AperturaVentanilla, apertura => apertura.usuario)
  aperturas: AperturaVentanilla[];

  @OneToMany(() => CierreVentanilla, cierre => cierre.usuario)
  cierres: CierreVentanilla[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}