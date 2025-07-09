import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { AppDataSource } from './DbModel/data-source';

// Importar rutas
import casaDeCambioRoutes from './Routes/CasaDeCambioRoutes';
import usuarioRoutes from './Routes/UsuarioRoutes';
import personaRoutes from './Routes/PersonaRoutes';
import ventanillaRoutes from './Routes/VentanillaRoutes';
import monedaRoutes from './Routes/MonedaRoutes';
import tipoCambioRoutes from './Routes/TipoCambioRoutes';
import clienteRoutes from './Routes/ClienteRoutes';
import transaccionRoutes from './Routes/TransaccionRoutes';
import reporteRoutes from './Routes/ReporteRoutes';

// Cargar variables de entorno
config();

class App {
  public app: express.Application;
  public port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeDatabase();
  }

  private initializeMiddlewares(): void {
    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true,
    }));

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Headers de seguridad básicos
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

    // Middleware para logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  private initializeRoutes(): void {
    // Ruta básica para verificar que el servidor está funcionando
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Foreign Exchange API is running',
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // Ruta de salud
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: this.port,
      });
    });

    // API Routes
    this.app.use('/api/casas-de-cambio', casaDeCambioRoutes);
    this.app.use('/api/usuarios', usuarioRoutes);
    this.app.use('/api/personas', personaRoutes);
    this.app.use('/api/ventanillas', ventanillaRoutes);
    this.app.use('/api/monedas', monedaRoutes);
    this.app.use('/api/tipos-cambio', tipoCambioRoutes);
    this.app.use('/api/clientes', clienteRoutes);
    this.app.use('/api/transacciones', transaccionRoutes);
    this.app.use('/api/reportes', reporteRoutes);

    // Manejo de rutas no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        message: 'Ruta no encontrada',
        path: req.originalUrl,
      });
    });

    // Manejo de errores global
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error no manejado:', error);
      
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log('🔌 Intentando conectar a la base de datos...');
      await AppDataSource.initialize();
      console.log('✅ Conexión a la base de datos establecida correctamente');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Sincronizando esquema de base de datos...');
      }
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error);
      
      // En producción, permitir que la aplicación continúe para debugging
      if (process.env.NODE_ENV === 'production') {
        console.error('⚠️  La aplicación continuará sin base de datos para debug');
      } else {
        process.exit(1);
      }
    }
  }

  public listen(): void {
    console.log(`📍 Intentando escuchar en puerto: ${this.port}`);
    console.log(`🌍 Variables de entorno PORT: ${process.env.PORT}`);
    
    const server = this.app.listen(this.port, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${this.port}`);
      console.log(`🌐 Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponible en: http://localhost:${this.port}/api`);
      console.log(`❤️  Health check: http://localhost:${this.port}/api/health`);
    });

    server.on('error', (error: any) => {
      console.error('❌ Error al iniciar el servidor:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`🚫 Puerto ${this.port} ya está en uso`);
      }
    });
  }
}

// Inicializar y ejecutar la aplicación
const app = new App();
app.listen();

export default app;