import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 100, name: 'apellido_paterno' })
  apellido_paterno: string;

  @Column({ type: 'varchar', length: 100, name: 'apellido_materno' })
  apellido_materno: string;

  @Column({ type: 'date', name: 'fecha_nacimiento' })
  fecha_nacimiento: Date;

  @Column({ type: 'varchar', length: 20, name: 'numero_telefono' })
  numero_telefono: string;

  @Column({ type: 'text' })
  direccion: string;

  @Column({ type: 'varchar', length: 50, name: 'tipo_documento' })
  tipo_documento: string; // DNI, CE, PASAPORTE, etc.

  @Column({ type: 'varchar', length: 20, unique: true, name: 'numero_documento' })
  numero_documento: string;

  @Column({ type: 'varchar', length: 100 })
  nacionalidad: string;

  @Column({ type: 'varchar', length: 100 })
  ocupacion: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}