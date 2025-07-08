import { CreateUsuarioRequest, UpdateUsuarioRequest, LoginRequest } from '../Models/Usuario/UsuarioRequestParams';
import { UsuarioDto } from '../Models/Usuario/UsuarioDto';

export interface IUsuarioService {
  /**
   * Crea un nuevo usuario
   */
  create(request: CreateUsuarioRequest): Promise<UsuarioDto>;

  /**
   * Autentica un usuario
   */
  login(request: LoginRequest): Promise<{ usuario: UsuarioDto; token: string } | null>;

  /**
   * Obtiene todos los usuarios de una casa de cambio
   */
  getByCasaDeCambio(casaDeCambioId: number): Promise<UsuarioDto[]>;

  /**
   * Obtiene un usuario por ID
   */
  getById(id: number): Promise<UsuarioDto | null>;

  /**
   * Obtiene un usuario por username
   */
  getByUsername(username: string): Promise<UsuarioDto | null>;

  /**
   * Actualiza un usuario
   */
  update(id: number, request: UpdateUsuarioRequest): Promise<UsuarioDto | null>;

  /**
   * Activa o desactiva un usuario
   */
  toggleActive(id: number): Promise<UsuarioDto | null>;

  /**
   * Verifica si existen al menos 2 administradores en una casa de cambio
   */
  verifyAdminRequirements(casaDeCambioId: number): Promise<boolean>;

  /**
   * Cambia la contraseña de un usuario
   */
  changePassword(id: number, oldPassword: string, newPassword: string): Promise<boolean>;
}