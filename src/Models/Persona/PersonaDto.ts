import { IsString, IsDateString, IsNotEmpty, Length } from 'class-validator';

export class PersonaDto {
  id?: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido_paterno: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido_materno: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento: Date;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  numero_telefono: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  tipo_documento: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  numero_documento: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nacionalidad: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  ocupacion: string;

  created_at?: Date;
  updated_at?: Date;
}