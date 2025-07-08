import { Repository } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { Usuario } from '../../DbModel/Entities/Usuario';
import { CasaDeCambio } from '../../DbModel/Entities/CasaDeCambio';
import { Persona } from '../../DbModel/Entities/Persona';
import { AperturaVentanilla } from '../../DbModel/Entities/AperturaVentanilla';
import { IUsuarioService } from '../IUsuarioService';
import { CreateUsuarioRequest, UpdateUsuarioRequest, LoginRequest } from '../../Models/Usuario/UsuarioRequestParams';
import { UsuarioDto } from '../../Models/Usuario/UsuarioDto';
import { RolUsuario } from '../../DbModel/Enums';
import { AuthHelper } from '../../Helpers/AuthHelper';

export class UsuarioService implements IUsuarioService {
  private usuarioRepository: Repository<Usuario>;
  private casaDeCambioRepository: Repository<CasaDeCambio>;
  private personaRepository: Repository<Persona>;
  private aperturaVentanillaRepository: Repository<AperturaVentanilla>;

  constructor() {
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.casaDeCambioRepository = AppDataSource.getRepository(CasaDeCambio);
    this.personaRepository = AppDataSource.getRepository(Persona);
    this.aperturaVentanillaRepository = AppDataSource.getRepository(AperturaVentanilla);
  }

  async create(request: CreateUsuarioRequest): Promise<UsuarioDto> {
    // Verificar que la casa de cambio existe
    const casaDeCambio = await this.casaDeCambioRepository.findOne({
      where: { id: request.casa_de_cambio_id },
    });

    if (!casaDeCambio) {
      throw new Error('La casa de cambio especificada no existe');
    }

    // Verificar que la persona existe
    const persona = await this.personaRepository.findOne({
      where: { id: request.persona_id },
    });

    if (!persona) {
      throw new Error('La persona especificada no existe');
    }

    // Verificar que el username es único
    const existingUser = await this.usuarioRepository.findOne({
      where: { username: request.username },
    });

    if (existingUser) {
      throw new Error('Ya existe un usuario con ese nombre de usuario');
    }

    // Verificar que la persona no tenga ya un usuario en esta casa de cambio
    const existingUserForPerson = await this.usuarioRepository.findOne({
      where: { 
        persona_id: request.persona_id,
        casa_de_cambio_id: request.casa_de_cambio_id,
      },
    });

    if (existingUserForPerson) {
      throw new Error('Esta persona ya tiene un usuario registrado en esta casa de cambio');
    }

    // Verificar restricciones de administradores
    if (request.rol === RolUsuario.ADMINISTRADOR_MAESTRO) {
      const adminMaestroCount = await this.usuarioRepository.count({
        where: { 
          casa_de_cambio_id: request.casa_de_cambio_id,
          rol: RolUsuario.ADMINISTRADOR_MAESTRO,
        },
      });

      if (adminMaestroCount >= 1) {
        throw new Error('Solo puede existir un administrador maestro por casa de cambio');
      }
    }

    if (request.rol === RolUsuario.ADMINISTRADOR) {
      const adminCount = await this.usuarioRepository.count({
        where: { 
          casa_de_cambio_id: request.casa_de_cambio_id,
          rol: RolUsuario.ADMINISTRADOR,
        },
      });

      if (adminCount >= 1) {
        throw new Error('Solo puede existir un administrador por casa de cambio');
      }
    }

    // Encriptar contraseña
    const hashedPassword = await AuthHelper.hashPassword(request.password);

    const usuario = this.usuarioRepository.create({
      ...request,
      password: hashedPassword,
    });

    const savedUsuario = await this.usuarioRepository.save(usuario);
    return this.entityToDto(savedUsuario);
  }

  async login(request: LoginRequest): Promise<{ usuario: UsuarioDto; token: string } | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { username: request.username, activo: true },
      relations: ['casa_de_cambio', 'persona'],
    });

    if (!usuario) {
      return null;
    }

    const isPasswordValid = await AuthHelper.comparePassword(request.password, usuario.password);
    
    if (!isPasswordValid) {
      return null;
    }

    const token = AuthHelper.generateToken(usuario);

    return {
      usuario: this.entityToDto(usuario),
      token,
    };
  }

  async getByCasaDeCambio(casaDeCambioId: number): Promise<UsuarioDto[]> {
    const usuarios = await this.usuarioRepository.find({
      where: { casa_de_cambio_id: casaDeCambioId },
      relations: ['persona'],
    });

    return usuarios.map(usuario => this.entityToDto(usuario));
  }

  async getById(id: number): Promise<UsuarioDto | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['persona'],
    });

    return usuario ? this.entityToDto(usuario) : null;
  }

  async getByUsername(username: string): Promise<UsuarioDto | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { username },
      relations: ['persona'],
    });

    return usuario ? this.entityToDto(usuario) : null;
  }

  async update(id: number, request: UpdateUsuarioRequest): Promise<UsuarioDto | null> {
    const usuario = await this.usuarioRepository.findOne({ 
      where: { id },
      relations: ['persona'],
    });

    if (!usuario) {
      return null;
    }

    // Si se cambia el username, verificar que es único
    if (request.username && request.username !== usuario.username) {
      const existingUser = await this.usuarioRepository.findOne({
        where: { username: request.username },
      });

      if (existingUser) {
        throw new Error('Ya existe un usuario con ese nombre de usuario');
      }
    }

    // Si se cambia la persona, verificar que existe y no tenga ya un usuario en esta casa de cambio
    if (request.persona_id && request.persona_id !== usuario.persona_id) {
      const persona = await this.personaRepository.findOne({
        where: { id: request.persona_id },
      });

      if (!persona) {
        throw new Error('La persona especificada no existe');
      }

      const existingUserForPerson = await this.usuarioRepository.findOne({
        where: { 
          persona_id: request.persona_id,
          casa_de_cambio_id: usuario.casa_de_cambio_id,
        },
      });

      if (existingUserForPerson && existingUserForPerson.id !== id) {
        throw new Error('Esta persona ya tiene un usuario registrado en esta casa de cambio');
      }
    }

    // Si se cambia la contraseña, encriptarla
    if (request.password) {
      request.password = await AuthHelper.hashPassword(request.password);
    }

    Object.assign(usuario, request);
    const updatedUsuario = await this.usuarioRepository.save(usuario);

    // Recargar con relaciones
    const reloadedUsuario = await this.usuarioRepository.findOne({
      where: { id: updatedUsuario.id },
      relations: ['persona'],
    });

    return reloadedUsuario ? this.entityToDto(reloadedUsuario) : null;
  }

  async toggleActive(id: number): Promise<UsuarioDto | null> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      return null;
    }

    usuario.activo = !usuario.activo;
    const updatedUsuario = await this.usuarioRepository.save(usuario);

    return this.entityToDto(updatedUsuario);
  }

  async verifyAdminRequirements(casaDeCambioId: number): Promise<boolean> {
    const adminMaestroCount = await this.usuarioRepository.count({
      where: { 
        casa_de_cambio_id: casaDeCambioId,
        rol: RolUsuario.ADMINISTRADOR_MAESTRO,
        activo: true,
      },
    });

    const adminCount = await this.usuarioRepository.count({
      where: { 
        casa_de_cambio_id: casaDeCambioId,
        rol: RolUsuario.ADMINISTRADOR,
        activo: true,
      },
    });

    return adminMaestroCount === 1 && adminCount === 1;
  }

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      return false;
    }

    const isOldPasswordValid = await AuthHelper.comparePassword(oldPassword, usuario.password);
    
    if (!isOldPasswordValid) {
      return false;
    }

    const hashedNewPassword = await AuthHelper.hashPassword(newPassword);
    usuario.password = hashedNewPassword;
    
    await this.usuarioRepository.save(usuario);
    return true;
  }

  /**
   * Verifica si un usuario de ventanilla tiene una ventanilla actualmente abierta
   */
  async hasVentanillaActiva(usuarioId: number): Promise<{ hasVentanilla: boolean; ventanillaId?: number; ventanillaNombre?: string }> {
    const aperturaActiva = await this.aperturaVentanillaRepository.findOne({
      where: { 
        usuario_id: usuarioId,
        activa: true,
      },
      relations: ['ventanilla'],
    });

    if (aperturaActiva) {
      return {
        hasVentanilla: true,
        ventanillaId: aperturaActiva.ventanilla_id,
        ventanillaNombre: aperturaActiva.ventanilla?.nombre || 'N/A',
      };
    }

    return { hasVentanilla: false };
  }

  /**
   * Verifica si un usuario puede aperturar una ventanilla específica
   */
  async canAperturarVentanilla(usuarioId: number, ventanillaId: number): Promise<{ canAperturar: boolean; reason?: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    
    if (!usuario) {
      return { canAperturar: false, reason: 'Usuario no encontrado' };
    }

    // Solo usuarios de ventanilla tienen restricciones
    if (usuario.rol !== RolUsuario.ENCARGADO_VENTANILLA) {
      return { canAperturar: true };
    }

    // Verificar si ya tiene una ventanilla activa
    const ventanillaActiva = await this.hasVentanillaActiva(usuarioId);
    
    if (ventanillaActiva.hasVentanilla) {
      if (ventanillaActiva.ventanillaId === ventanillaId) {
        return { 
          canAperturar: false, 
          reason: 'Ya tienes esta ventanilla abierta' 
        };
      } else {
        return { 
          canAperturar: false, 
          reason: `Debes cerrar primero la ventanilla "${ventanillaActiva.ventanillaNombre}" antes de abrir otra` 
        };
      }
    }

    return { canAperturar: true };
  }

  /**
   * Obtiene la información de la ventanilla activa de un usuario
   */
  async getVentanillaActiva(usuarioId: number): Promise<AperturaVentanilla | null> {
    return await this.aperturaVentanillaRepository.findOne({
      where: { 
        usuario_id: usuarioId,
        activa: true,
      },
      relations: ['ventanilla', 'montos_apertura'],
    });
  }

  /**
   * Verifica si un usuario puede ver información de ganancias
   */
  async canViewGanancias(usuarioId: number): Promise<boolean> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    
    if (!usuario) {
      return false;
    }

    // Solo admins pueden ver ganancias, usuarios de ventanilla NO
    return usuario.rol === RolUsuario.ADMINISTRADOR_MAESTRO || usuario.rol === RolUsuario.ADMINISTRADOR;
  }

  /**
   * Obtiene usuarios de ventanilla por casa de cambio
   */
  async getUsuariosVentanillaByCasa(casaDeCambioId: number): Promise<UsuarioDto[]> {
    const usuarios = await this.usuarioRepository.find({
      where: { 
        casa_de_cambio_id: casaDeCambioId,
        rol: RolUsuario.ENCARGADO_VENTANILLA,
        activo: true,
      },
      relations: ['persona'],
    });

    return usuarios.map(usuario => this.entityToDto(usuario));
  }

  private entityToDto(entity: Usuario): UsuarioDto {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      rol: entity.rol,
      activo: entity.activo,
      persona_id: entity.persona_id,
      casa_de_cambio_id: entity.casa_de_cambio_id,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      // Incluir relaciones si están cargadas
      persona: entity.persona ? {
        id: entity.persona.id,
        nombres: entity.persona.nombres,
        apellido_paterno: entity.persona.apellido_paterno,
        apellido_materno: entity.persona.apellido_materno,
        fecha_nacimiento: entity.persona.fecha_nacimiento,
        numero_telefono: entity.persona.numero_telefono,
        direccion: entity.persona.direccion,
        tipo_documento: entity.persona.tipo_documento,
        numero_documento: entity.persona.numero_documento,
        nacionalidad: entity.persona.nacionalidad,
        ocupacion: entity.persona.ocupacion,
        created_at: entity.persona.created_at,
        updated_at: entity.persona.updated_at,
      } : undefined,
      casa_de_cambio: entity.casa_de_cambio ? {
        id: entity.casa_de_cambio.id,
        identificador: entity.casa_de_cambio.identificador,
        nombre: entity.casa_de_cambio.nombre,
        direccion: entity.casa_de_cambio.direccion,
        telefono: entity.casa_de_cambio.telefono,
        email: entity.casa_de_cambio.email,
        ruc: entity.casa_de_cambio.ruc,
        razon_social: entity.casa_de_cambio.razon_social,
        moneda_maestra_id: entity.casa_de_cambio.moneda_maestra_id,
        activa: entity.casa_de_cambio.activa,
        created_at: entity.casa_de_cambio.created_at,
        updated_at: entity.casa_de_cambio.updated_at,
      } : undefined,
    };
  }
}