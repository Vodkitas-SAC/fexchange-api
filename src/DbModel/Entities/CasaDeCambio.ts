import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ventanilla } from './Ventanilla';
import { Usuario } from './Usuario';
import { Moneda } from './Moneda';
import { TipoCambio } from './TipoCambio';

@Entity('casas_de_cambio')
export class CasaDeCambio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  identificador: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'text' })
  direccion: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  ruc: string;

  @Column({ type: 'varchar', length: 200 })
  razon_social: string;

  // Relación con moneda maestra (obligatoria)
  @ManyToOne(() => Moneda, { nullable: false })
  @JoinColumn({ name: 'moneda_maestra_id' })
  moneda_maestra: Moneda;

  @Column({ name: 'moneda_maestra_id' })
  moneda_maestra_id: number;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  // Relaciones
  @OneToMany(() => Ventanilla, ventanilla => ventanilla.casa_de_cambio)
  ventanillas: Ventanilla[];

  @OneToMany(() => Usuario, usuario => usuario.casa_de_cambio)
  usuarios: Usuario[];

  @OneToMany(() => TipoCambio, tipo_cambio => tipo_cambio.casa_de_cambio)
  tipos_cambio: TipoCambio[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}