import { IsString, IsEmail, IsEnum, IsBoolean, IsNumber, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { RolUsuario } from '../../DbModel/Enums';
import { PersonaDto } from '../Persona/PersonaDto';
import { CasaDeCambioDto } from '../CasaDeCambio/CasaDeCambioDto';

export class UsuarioDto {
  id?: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  // password no se incluye en el DTO por seguridad

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsNumber()
  @IsNotEmpty()
  persona_id: number;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;

  created_at?: Date;
  updated_at?: Date;

  // Relaciones opcionales
  persona?: PersonaDto;
  casa_de_cambio?: CasaDeCambioDto;
}