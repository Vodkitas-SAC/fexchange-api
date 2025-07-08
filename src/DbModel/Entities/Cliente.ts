import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TipoCliente } from '../Enums';
import { Transaccion } from './Transaccion';
import { Persona } from './Persona';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TipoCliente,
    default: TipoCliente.OCASIONAL,
  })
  tipo: TipoCliente;

  // Descripción general del cliente
  @Column({ type: 'varchar', length: 200, default: 'Cliente Ocasional' })
  descripcion: string;

  // Campos empresariales (para tipo EMPRESARIAL)
  @Column({ type: 'varchar', length: 20, nullable: true })
  ruc: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  razon_social: string;

  @Column({ type: 'text', nullable: true })
  direccion_fiscal: string;

  // Campos adicionales para cumplir con SBS
  @Column({ type: 'varchar', length: 50, nullable: true })
  estado_civil: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profesion: string;

  // Control de estado del cliente
  @Column({ type: 'boolean', default: true })
  es_activo: boolean;

  // Relación con persona (opcional, solo para clientes registrados)
  @ManyToOne(() => Persona, { nullable: true })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ name: 'persona_id', nullable: true })
  persona_id: number;

  // Relaciones
  @OneToMany(() => Transaccion, transaccion => transaccion.cliente)
  transacciones: Transaccion[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}