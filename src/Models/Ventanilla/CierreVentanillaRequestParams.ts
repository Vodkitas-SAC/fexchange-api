import { IsArray, IsNumber, IsOptional, IsString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MontoCierreRequest {
  @IsNumber()
  moneda_id: number;

  @IsNumber()
  monto_fisico_real: number;

  @IsBoolean()
  confirmado_fisicamente: boolean;

  @IsOptional()
  @IsString()
  observaciones_desfase?: string;
}

export class CierreVentanillaRequest {
  @IsNumber()
  apertura_ventanilla_id: number;

  @IsOptional()
  @IsString()
  observaciones_cierre?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MontoCierreRequest)
  montos_cierre: MontoCierreRequest[];
}