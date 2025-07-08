import { IsString, IsEmail, IsEnum, IsBoolean, IsNumber, IsNotEmpty, Length, IsOptional, MinLength } from 'class-validator';
import { RolUsuario } from '../../DbModel/Enums';

export class CreateUsuarioRequest {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;

  @IsNumber()
  @IsNotEmpty()
  persona_id: number;

  @IsNumber()
  @IsNotEmpty()
  casa_de_cambio_id: number;
}

export class UpdateUsuarioRequest {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsNumber()
  @IsOptional()
  persona_id?: number;
}

export class LoginRequest {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}