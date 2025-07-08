import { Repository } from 'typeorm';
import { AppDataSource } from '../../DbModel/data-source';
import { Cliente } from '../../DbModel/Entities/Cliente';
import { Persona } from '../../DbModel/Entities/Persona';
import { IClienteService } from '../IClienteService';
import { CreateClienteRequest, UpdateClienteRequest, CreateClienteRegistradoRequest, CreateClienteOcasionalRequest, CreateClienteEmpresarialRequest } from '../../Models/Cliente/ClienteRequestParams';
import { ClienteDto } from '../../Models/Cliente/ClienteDto';
import { TipoCliente } from '../../DbModel/Enums';

export class ClienteService implements IClienteService {
  private clienteRepository: Repository<Cliente>;
  private personaRepository: Repository<Persona>;

  constructor() {
    this.clienteRepository = AppDataSource.getRepository(Cliente);
    this.personaRepository = AppDataSource.getRepository(Persona);
  }

  async create(request: CreateClienteRequest): Promise<ClienteDto> {
    // Validar persona si es un cliente registrado
    if (request.tipo === TipoCliente.REGISTRADO && request.persona_id) {
      const persona = await this.personaRepository.findOne({
        where: { id: request.persona_id },
      });
      if (!persona) {
        throw new Error('La persona especificada no existe');
      }

      // Verificar que no exista ya un cliente registrado para esta persona
      const clienteExistente = await this.clienteRepository.findOne({
        where: { persona_id: request.persona_id, tipo: TipoCliente.REGISTRADO },
      });
      if (clienteExistente) {
        throw new Error('Ya existe un cliente registrado para esta persona');
      }
    }

    // Validar RUC único si se proporciona
    if (request.ruc) {
      const clienteConRuc = await this.clienteRepository.findOne({
        where: { ruc: request.ruc },
      });
      if (clienteConRuc) {
        throw new Error('Ya existe un cliente con este RUC');
      }
    }

    const nuevoCliente = this.clienteRepository.create({
      tipo: request.tipo,
      descripcion: request.descripcion || this.getDescripcionDefault(request.tipo),
      direccion_fiscal: request.direccion_fiscal,
      profesion: request.profesion,
      es_activo: request.es_activo !== undefined ? request.es_activo : true,
      ruc: request.ruc,
      razon_social: request.razon_social,
      estado_civil: request.estado_civil,
      persona_id: request.persona_id,
    });

    const clienteGuardado = await this.clienteRepository.save(nuevoCliente);
    return this.mapToDto(clienteGuardado);
  }

  async createRegistrado(request: CreateClienteRegistradoRequest): Promise<ClienteDto> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear la persona primero
      const personaRepository = queryRunner.manager.getRepository(Persona);
      const nuevaPersona = personaRepository.create({
        nombres: request.persona.nombres,
        apellido_paterno: request.persona.apellido_paterno,
        apellido_materno: request.persona.apellido_materno,
        fecha_nacimiento: request.persona.fecha_nacimiento,
        numero_telefono: request.persona.numero_telefono,
        direccion: request.persona.direccion,
        tipo_documento: request.persona.tipo_documento,
        numero_documento: request.persona.numero_documento,
        nacionalidad: request.persona.nacionalidad,
        ocupacion: request.persona.ocupacion,
      });

      const personaGuardada = await personaRepository.save(nuevaPersona);

      // Validar RUC único si se proporciona
      if (request.ruc) {
        const clienteRepository = queryRunner.manager.getRepository(Cliente);
        const clienteConRuc = await clienteRepository.findOne({
          where: { ruc: request.ruc },
        });
        if (clienteConRuc) {
          throw new Error('Ya existe un cliente con este RUC');
        }
      }

      // Crear el cliente con la persona creada
      const clienteRepository = queryRunner.manager.getRepository(Cliente);
      const nuevoCliente = clienteRepository.create({
        tipo: TipoCliente.REGISTRADO,
        persona_id: personaGuardada.id,
        ruc: request.ruc,
        razon_social: request.razon_social,
        estado_civil: request.estado_civil,
        direccion_fiscal: request.direccion_fiscal,
        profesion: request.profesion,
        descripcion: request.descripcion || 'Cliente Registrado',
      });

      const clienteGuardado = await clienteRepository.save(nuevoCliente);

      await queryRunner.commitTransaction();
      return this.mapToDto(clienteGuardado);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createOcasional(request: CreateClienteOcasionalRequest): Promise<ClienteDto> {
    const createRequest: CreateClienteRequest = {
      tipo: TipoCliente.OCASIONAL,
      descripcion: request.descripcion || 'Cliente Ocasional',
    };

    return this.create(createRequest);
  }

  async createEmpresarial(request: CreateClienteEmpresarialRequest): Promise<ClienteDto> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear la persona representante legal primero
      const personaRepository = queryRunner.manager.getRepository(Persona);
      const nuevaPersona = personaRepository.create({
        nombres: request.representante_legal.nombres,
        apellido_paterno: request.representante_legal.apellido_paterno,
        apellido_materno: request.representante_legal.apellido_materno,
        fecha_nacimiento: request.representante_legal.fecha_nacimiento,
        numero_telefono: request.representante_legal.numero_telefono,
        direccion: request.representante_legal.direccion,
        tipo_documento: request.representante_legal.tipo_documento,
        numero_documento: request.representante_legal.numero_documento,
        nacionalidad: request.representante_legal.nacionalidad,
        ocupacion: request.representante_legal.ocupacion,
      });

      const personaGuardada = await personaRepository.save(nuevaPersona);

      // Validar RUC único
      const clienteRepository = queryRunner.manager.getRepository(Cliente);
      const clienteConRuc = await clienteRepository.findOne({
        where: { ruc: request.ruc },
      });
      if (clienteConRuc) {
        throw new Error('Ya existe un cliente con este RUC');
      }

      // Crear el cliente empresarial
      const nuevoCliente = clienteRepository.create({
        tipo: TipoCliente.EMPRESARIAL,
        razon_social: request.razon_social,
        ruc: request.ruc,
        direccion_fiscal: request.direccion_fiscal,
        persona_id: personaGuardada.id,
        descripcion: request.descripcion || `Empresa: ${request.razon_social}`,
        es_activo: true,
      });

      const clienteGuardado = await clienteRepository.save(nuevoCliente);

      await queryRunner.commitTransaction();
      return this.mapToDto(clienteGuardado);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getById(id: number): Promise<ClienteDto | null> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['persona'],
    });

    return cliente ? this.mapToDto(cliente) : null;
  }

  async getAll(): Promise<ClienteDto[]> {
    const clientes = await this.clienteRepository.find({
      relations: ['persona'],
      order: { created_at: 'DESC' },
    });

    return clientes.map(cliente => this.mapToDto(cliente));
  }

  async getByDocumento(numeroDocumento: string): Promise<ClienteDto | null> {
    const cliente = await this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.persona', 'persona')
      .where('cliente.tipo = :tipo', { tipo: TipoCliente.REGISTRADO })
      .andWhere('persona.numero_documento = :numeroDocumento', { numeroDocumento })
      .getOne();

    return cliente ? this.mapToDto(cliente) : null;
  }

  async update(id: number, request: UpdateClienteRequest): Promise<ClienteDto> {
    const clienteExistente = await this.clienteRepository.findOne({
      where: { id },
    });

    if (!clienteExistente) {
      throw new Error('Cliente no encontrado');
    }

    // Validar persona si se está cambiando
    if (request.persona_id && request.persona_id !== clienteExistente.persona_id) {
      const persona = await this.personaRepository.findOne({
        where: { id: request.persona_id },
      });
      if (!persona) {
        throw new Error('La persona especificada no existe');
      }

      // Verificar que no exista ya un cliente registrado para esta persona
      if ((request.tipo === TipoCliente.REGISTRADO || request.tipo === TipoCliente.EMPRESARIAL) || 
          (clienteExistente.tipo === TipoCliente.REGISTRADO || clienteExistente.tipo === TipoCliente.EMPRESARIAL)) {
        const clienteConPersona = await this.clienteRepository.findOne({
          where: { persona_id: request.persona_id, tipo: TipoCliente.REGISTRADO },
        });
        if (clienteConPersona && clienteConPersona.id !== id) {
          throw new Error('Ya existe un cliente registrado para esta persona');
        }
      }
    }

    // Validar RUC único si se está cambiando
    if (request.ruc && request.ruc !== clienteExistente.ruc) {
      const clienteConRuc = await this.clienteRepository.findOne({
        where: { ruc: request.ruc },
      });
      if (clienteConRuc && clienteConRuc.id !== id) {
        throw new Error('Ya existe un cliente con este RUC');
      }
    }

    // Actualizar campos
    const camposActualizar: any = {};
    if (request.tipo !== undefined) camposActualizar.tipo = request.tipo;
    if (request.descripcion !== undefined) camposActualizar.descripcion = request.descripcion;
    if (request.ruc !== undefined) camposActualizar.ruc = request.ruc;
    if (request.razon_social !== undefined) camposActualizar.razon_social = request.razon_social;
    if (request.estado_civil !== undefined) camposActualizar.estado_civil = request.estado_civil;
    if (request.direccion_fiscal !== undefined) camposActualizar.direccion_fiscal = request.direccion_fiscal;
    if (request.profesion !== undefined) camposActualizar.profesion = request.profesion;
    if (request.es_activo !== undefined) camposActualizar.es_activo = request.es_activo;
    if (request.persona_id !== undefined) camposActualizar.persona_id = request.persona_id;

    await this.clienteRepository.update(id, camposActualizar);

    const clienteActualizado = await this.clienteRepository.findOne({
      where: { id },
      relations: ['persona'],
    });

    return this.mapToDto(clienteActualizado!);
  }

  async delete(id: number): Promise<boolean> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Verificar que no tenga transacciones
    const transacciones = await this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoin('cliente.transacciones', 'transaccion')
      .where('cliente.id = :id', { id })
      .andWhere('transaccion.id IS NOT NULL')
      .getCount();

    if (transacciones > 0) {
      throw new Error('No se puede eliminar el cliente porque tiene transacciones asociadas');
    }

    await this.clienteRepository.remove(cliente);
    return true;
  }

  async search(filtros: {
    tipo?: string;
    ruc?: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    numeroDocumento?: string;
    razonSocial?: string;
    esActivo?: boolean;
    profesion?: string;
  }): Promise<ClienteDto[]> {
    const queryBuilder = this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.persona', 'persona');

    if (filtros.tipo) {
      queryBuilder.andWhere('cliente.tipo = :tipo', { tipo: filtros.tipo });
    }

    if (filtros.ruc) {
      queryBuilder.andWhere('cliente.ruc ILIKE :ruc', { ruc: `%${filtros.ruc}%` });
    }

    if (filtros.nombres) {
      queryBuilder.andWhere('persona.nombres ILIKE :nombres', { nombres: `%${filtros.nombres}%` });
    }

    if (filtros.apellidoPaterno) {
      queryBuilder.andWhere('persona.apellido_paterno ILIKE :apellidoPaterno', { 
        apellidoPaterno: `%${filtros.apellidoPaterno}%` 
      });
    }

    if (filtros.apellidoMaterno) {
      queryBuilder.andWhere('persona.apellido_materno ILIKE :apellidoMaterno', { 
        apellidoMaterno: `%${filtros.apellidoMaterno}%` 
      });
    }

    if (filtros.numeroDocumento) {
      queryBuilder.andWhere('persona.numero_documento ILIKE :numeroDocumento', { 
        numeroDocumento: `%${filtros.numeroDocumento}%` 
      });
    }

    if (filtros.razonSocial) {
      queryBuilder.andWhere('cliente.razon_social ILIKE :razonSocial', { 
        razonSocial: `%${filtros.razonSocial}%` 
      });
    }

    if (filtros.esActivo !== undefined) {
      queryBuilder.andWhere('cliente.es_activo = :esActivo', { esActivo: filtros.esActivo });
    }

    if (filtros.profesion) {
      queryBuilder.andWhere('cliente.profesion ILIKE :profesion', { 
        profesion: `%${filtros.profesion}%` 
      });
    }

    const clientes = await queryBuilder
      .orderBy('cliente.created_at', 'DESC')
      .getMany();

    return clientes.map(cliente => this.mapToDto(cliente));
  }

  private mapToDto(cliente: Cliente): ClienteDto {
    return {
      id: cliente.id,
      tipo: cliente.tipo,
      descripcion: cliente.descripcion,
      ruc: cliente.ruc,
      razon_social: cliente.razon_social,
      direccion_fiscal: cliente.direccion_fiscal,
      estado_civil: cliente.estado_civil,
      profesion: cliente.profesion,
      es_activo: cliente.es_activo,
      persona_id: cliente.persona_id,
      persona: cliente.persona ? {
        nombres: cliente.persona.nombres,
        apellido_paterno: cliente.persona.apellido_paterno,
        apellido_materno: cliente.persona.apellido_materno,
        numero_documento: cliente.persona.numero_documento,
        fecha_nacimiento: cliente.persona.fecha_nacimiento,
        numero_telefono: cliente.persona.numero_telefono,
        direccion: cliente.persona.direccion,
        tipo_documento: cliente.persona.tipo_documento,
        nacionalidad: cliente.persona.nacionalidad,
        ocupacion: cliente.persona.ocupacion,
      } : undefined,
      created_at: cliente.created_at,
      updated_at: cliente.updated_at,
    };
  }

  async toggleEstado(id: number): Promise<ClienteDto> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['persona'],
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    cliente.es_activo = !cliente.es_activo;
    const clienteActualizado = await this.clienteRepository.save(cliente);
    return this.mapToDto(clienteActualizado);
  }

  async validarDatosSegunTipo(tipo: string, datos: any): Promise<{ valido: boolean; errores: string[] }> {
    const errores: string[] = [];

    switch (tipo) {
      case TipoCliente.REGISTRADO:
        if (!datos.persona_id) {
          errores.push('Persona requerida para cliente registrado');
        }
        break;

      case TipoCliente.EMPRESARIAL:
        if (!datos.ruc) {
          errores.push('RUC requerido para cliente empresarial');
        }
        if (!datos.razon_social) {
          errores.push('Razón social requerida para cliente empresarial');
        }
        if (!datos.direccion_fiscal) {
          errores.push('Dirección fiscal requerida para cliente empresarial');
        }
        if (!datos.representante_legal && !datos.persona_id) {
          errores.push('Representante legal requerido para cliente empresarial');
        }
        break;

      case TipoCliente.OCASIONAL:
        // Cliente ocasional no requiere validaciones específicas
        break;

      default:
        errores.push('Tipo de cliente no válido');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  async getByTipo(tipo: string): Promise<ClienteDto[]> {
    const clientes = await this.clienteRepository.find({
      where: { tipo: tipo as TipoCliente },
      relations: ['persona'],
      order: { created_at: 'DESC' },
    });

    return clientes.map(cliente => this.mapToDto(cliente));
  }

  async existeRuc(ruc: string, excludeId?: number): Promise<boolean> {
    const queryBuilder = this.clienteRepository
      .createQueryBuilder('cliente')
      .where('cliente.ruc = :ruc', { ruc });

    if (excludeId) {
      queryBuilder.andWhere('cliente.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async getHistorialTransacciones(clienteId: number): Promise<any[]> {
    const cliente = await this.clienteRepository.findOne({
      where: { id: clienteId },
      relations: ['transacciones', 'transacciones.moneda_origen', 'transacciones.moneda_destino', 'transacciones.ventanilla'],
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    return cliente.transacciones.map(transaccion => ({
      id: transaccion.id,
      numero_transaccion: transaccion.numero_transaccion,
      monto_origen: transaccion.monto_origen,
      monto_destino: transaccion.monto_destino,
      tipo_cambio_aplicado: transaccion.tipo_cambio_aplicado,
      estado: transaccion.estado,
      moneda_origen: transaccion.moneda_origen?.codigo,
      moneda_destino: transaccion.moneda_destino?.codigo,
      ventanilla: transaccion.ventanilla?.identificador,
      created_at: transaccion.created_at,
    }));
  }

  private getDescripcionDefault(tipo: TipoCliente): string {
    switch (tipo) {
      case TipoCliente.REGISTRADO:
        return 'Cliente Registrado';
      case TipoCliente.EMPRESARIAL:
        return 'Cliente Empresarial';
      case TipoCliente.OCASIONAL:
        return 'Cliente Ocasional';
      default:
        return 'Cliente';
    }
  }
}