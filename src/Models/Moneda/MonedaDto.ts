import { IsString, IsNumber, IsBoolean, IsNotEmpty, Length, Min, Max, IsOptional } from 'class-validator';

export class MonedaDto {
  id?: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  simbolo: string;

  @IsNumber()
  @Min(0)
  @Max(8)
  decimales: number;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;

  created_at?: Date;
  updated_at?: Date;
}