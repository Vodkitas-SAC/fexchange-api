export interface MontoCierreDto {
  id?: number;
  moneda_id: number;
  moneda?: {
    id: number;
    codigo: string;
    nombre: string;
    simbolo: string;
  };
  monto: number;
  monto_esperado: number;
  monto_fisico_real?: number;
  desfase_monto: number;
  desfase_porcentaje: number;
  confirmado_fisicamente: boolean;
  observaciones_desfase?: string;
}

export interface CierreVentanillaDto {
  id?: number;
  fecha_cierre: Date;
  hora_cierre: string;
  ganancia_total: number;
  observaciones_cierre?: string;
  ventanilla_id: number;
  usuario_id: number;
  apertura_ventanilla_id: number;
  montos_cierre: MontoCierreDto[];
  created_at?: Date;
  updated_at?: Date;
}

export interface CierreVentanillaResumenDto {
  apertura_ventanilla_id: number;
  montos_esperados: MontoCierreDto[];
  total_transacciones: number;
  ganancia_total_calculada: number;
}