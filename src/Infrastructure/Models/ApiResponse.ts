/**
 * Modelo estándar para respuestas de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
  timestamp: string;
}

/**
 * Información de paginación
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Error de validación
 */
export interface ValidationError {
  property: string;
  constraints: { [key: string]: string };
  value?: any;
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Filtros de fecha
 */
export interface DateFilter {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Respuesta de login
 */
export interface LoginResponse {
  usuario: {
    id: number;
    username: string;
    nombres: string;
    apellidos: string;
    rol: string;
    casa_de_cambio_id: number;
  };
  token: string;
  expiresIn: string;
}

/**
 * Información de reporte
 */
export interface ReportInfo {
  generatedAt: Date;
  reportType: string;
  filters: any;
  totalRecords: number;
}