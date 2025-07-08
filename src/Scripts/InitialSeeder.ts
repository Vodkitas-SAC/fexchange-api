import 'reflect-metadata';
import { config } from 'dotenv';
import { AppDataSource } from '../DbModel/data-source';
import { Persona } from '../DbModel/Entities/Persona';
import { Usuario } from '../DbModel/Entities/Usuario';
import { Moneda } from '../DbModel/Entities/Moneda';
import { CasaDeCambio } from '../DbModel/Entities/CasaDeCambio';
import { RolUsuario } from '../DbModel/Enums';
import { AuthHelper } from '../Helpers/AuthHelper';

// Cargar variables de entorno
config();

async function createInitialData() {
  try {
    console.log('🌱 Iniciando creación de datos iniciales...');

    // Inicializar conexión a la base de datos
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    const personaRepository = AppDataSource.getRepository(Persona);
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const monedaRepository = AppDataSource.getRepository(Moneda);
    const casaDeCambioRepository = AppDataSource.getRepository(CasaDeCambio);

    // 1. Crear monedas básicas
    console.log('💰 Creando monedas básicas...');
    
    const monedas = [
      {
        codigo: 'PEN',
        nombre: 'Sol Peruano',
        simbolo: 'S/',
        decimales: 2,
        activa: true,
      },
      {
        codigo: 'USD',
        nombre: 'Dólar Americano',
        simbolo: '$',
        decimales: 2,
        activa: true,
      },
      {
        codigo: 'EUR',
        nombre: 'Euro',
        simbolo: '€',
        decimales: 2,
        activa: true,
      },
    ];

    const monedasCreadas = [];
    for (const monedaData of monedas) {
      const existingMoneda = await monedaRepository.findOne({
        where: { codigo: monedaData.codigo },
      });

      if (!existingMoneda) {
        const moneda = monedaRepository.create(monedaData);
        const savedMoneda = await monedaRepository.save(moneda);
        monedasCreadas.push(savedMoneda);
        console.log(`  ✅ Moneda ${monedaData.codigo} creada`);
      } else {
        monedasCreadas.push(existingMoneda);
        console.log(`  ⚠️  Moneda ${monedaData.codigo} ya existe`);
      }
    }

    // 2. Crear casa de cambio principal
    console.log('🏢 Creando casa de cambio principal...');
    
    const monedaPEN = monedasCreadas.find(m => m.codigo === 'PEN');
    
    let casaDeCambio = await casaDeCambioRepository.findOne({
      where: { identificador: 'PRINCIPAL' },
    });

    if (!casaDeCambio) {
      casaDeCambio = casaDeCambioRepository.create({
        identificador: 'PRINCIPAL',
        nombre: 'Casa de Cambio Principal',
        direccion: 'Av. Principal 123, Lima, Perú',
        telefono: '01-234-5678',
        email: 'admin@casadecambio.com',
        ruc: '20123456789',
        razon_social: 'Casa de Cambio Principal S.A.C.',
        moneda_maestra_id: monedaPEN!.id,
      });

      casaDeCambio = await casaDeCambioRepository.save(casaDeCambio);
      console.log('  ✅ Casa de cambio principal creada');
    } else {
      console.log('  ⚠️  Casa de cambio principal ya existe');
    }

    // 3. Crear persona para el superadministrador
    console.log('👤 Creando persona para superadministrador...');
    
    let persona = await personaRepository.findOne({
      where: { numero_documento: '00000001' },
    });

    if (!persona) {
      persona = personaRepository.create({
        nombres: 'Super',
        apellido_paterno: 'Administrador',
        apellido_materno: 'Sistema',
        fecha_nacimiento: new Date('1980-01-01'),
        numero_telefono: '999000001',
        direccion: 'Dirección del Sistema',
        tipo_documento: 'DNI',
        numero_documento: '00000001',
        nacionalidad: 'Peruana',
        ocupacion: 'Administrador del Sistema',
      });

      persona = await personaRepository.save(persona);
      console.log('  ✅ Persona para superadministrador creada');
    } else {
      console.log('  ⚠️  Persona para superadministrador ya existe');
    }

    // 4. Crear usuario superadministrador
    console.log('🔐 Creando usuario superadministrador...');
    
    let superAdmin = await usuarioRepository.findOne({
      where: { username: 'superadmin' },
    });

    if (!superAdmin) {
      const hashedPassword = await AuthHelper.hashPassword('admin123');
      
      superAdmin = usuarioRepository.create({
        username: 'superadmin',
        password: hashedPassword,
        email: 'superadmin@casadecambio.com',
        rol: RolUsuario.ADMINISTRADOR_MAESTRO,
        activo: true,
        persona_id: persona.id,
        casa_de_cambio_id: casaDeCambio.id,
      });

      superAdmin = await usuarioRepository.save(superAdmin);
      console.log('  ✅ Usuario superadministrador creado');
      console.log('  📋 Credenciales:');
      console.log('      Username: superadmin');
      console.log('      Password: admin123');
    } else {
      console.log('  ⚠️  Usuario superadministrador ya existe');
    }

    // 5. Crear usuario administrador adicional
    console.log('👥 Creando usuario administrador adicional...');
    
    let personaAdmin = await personaRepository.findOne({
      where: { numero_documento: '00000002' },
    });

    if (!personaAdmin) {
      personaAdmin = personaRepository.create({
        nombres: 'Administrador',
        apellido_paterno: 'General',
        apellido_materno: 'Sistema',
        fecha_nacimiento: new Date('1985-01-01'),
        numero_telefono: '999000002',
        direccion: 'Dirección del Administrador',
        tipo_documento: 'DNI',
        numero_documento: '00000002',
        nacionalidad: 'Peruana',
        ocupacion: 'Administrador',
      });

      personaAdmin = await personaRepository.save(personaAdmin);
    }

    let admin = await usuarioRepository.findOne({
      where: { username: 'admin' },
    });

    if (!admin) {
      const hashedPassword = await AuthHelper.hashPassword('admin123');
      
      admin = usuarioRepository.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@casadecambio.com',
        rol: RolUsuario.ADMINISTRADOR,
        activo: true,
        persona_id: personaAdmin.id,
        casa_de_cambio_id: casaDeCambio.id,
      });

      admin = await usuarioRepository.save(admin);
      console.log('  ✅ Usuario administrador creado');
      console.log('  📋 Credenciales:');
      console.log('      Username: admin');
      console.log('      Password: admin123');
    } else {
      console.log('  ⚠️  Usuario administrador ya existe');
    }

    console.log('\n🎉 ¡Datos iniciales creados exitosamente!');
    console.log('\n📝 Resumen de credenciales:');
    console.log('   🔑 Superadministrador:');
    console.log('      Username: superadmin');
    console.log('      Password: admin123');
    console.log('   🔑 Administrador:');
    console.log('      Username: admin');
    console.log('      Password: admin123');
    console.log('\n🚀 Ya puedes usar estos usuarios para hacer login en /api/usuarios/login');

  } catch (error) {
    console.error('❌ Error creando datos iniciales:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar el seeder solo si se ejecuta directamente
if (require.main === module) {
  createInitialData();
}

export default createInitialData;