import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

/**
 * Configuración de la base de datos
 */
export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'sa123',
  database: process.env.DB_NAME || 'foreign_exchange',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  entities: ['src/DbModel/Entities/*.ts'],
  migrations: ['src/Migrations/*.ts'],
  subscribers: ['src/Subscribers/*.ts'],
  maxQueryExecutionTime: 5000, // 5 segundos
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
};

/**
 * Configuración específica para producción
 */
export const productionDatabaseConfig: DataSourceOptions = {
  ...databaseConfig,
  synchronize: false,
  logging: ['error'],
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
  extra: {
    ...databaseConfig.extra,
    connectionLimit: 20,
    ssl: process.env.DB_SSL === 'true',
  },
};

/**
 * Configuración para testing
 */
export const testDatabaseConfig: DataSourceOptions = {
  ...databaseConfig,
  database: process.env.TEST_DB_NAME || 'foreign_exchange_test',
  synchronize: true,
  logging: false,
  dropSchema: true,
};