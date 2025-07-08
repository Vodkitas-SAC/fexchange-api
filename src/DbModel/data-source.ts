import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Importar todas las entidades
import { CasaDeCambio } from './Entities/CasaDeCambio';
import { Ventanilla } from './Entities/Ventanilla';
import { Usuario } from './Entities/Usuario';
import { Cliente } from './Entities/Cliente';
import { Persona } from './Entities/Persona';
import { Moneda } from './Entities/Moneda';
import { TipoCambio } from './Entities/TipoCambio';
import { Transaccion } from './Entities/Transaccion';
import { AperturaVentanilla } from './Entities/AperturaVentanilla';
import { CierreVentanilla } from './Entities/CierreVentanilla';
import { MontoApertura } from './Entities/MontoApertura';
import { MontoCierre } from './Entities/MontoCierre';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'sa123',
  database: process.env.DB_NAME || 'foreign_exchange',
  synchronize: false, // IMPORTANTE: Cambiar a false para usar migraciones
  logging: process.env.NODE_ENV === 'development',
  entities: [
    Persona,        // Persona PRIMERA porque Usuario y Cliente dependen de ella
    CasaDeCambio,
    Moneda,
    Usuario,
    Cliente,
    Ventanilla,
    TipoCambio,
    Transaccion,
    AperturaVentanilla,
    CierreVentanilla,
    MontoApertura,
    MontoCierre,
  ],
  migrations: ['src/Migrations/*.ts'],
  subscribers: ['src/Subscribers/*.ts'],
});