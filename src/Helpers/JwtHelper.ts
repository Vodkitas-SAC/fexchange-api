import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { RolUsuario } from '../DbModel/Enums';

export interface JwtPayload {
  id: number;
  username: string;
  rol: RolUsuario;
  casa_de_cambio_id: number;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export class JwtHelper {
  private static readonly secret = process.env.JWT_SECRET || 'default-secret-key';

  /**
   * Middleware para autenticar el token JWT
   */
  static authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token de acceso requerido' });
      return;
    }

    try {
            
      // Verificar el token sin forzar el tipo
      const decoded = jwt.verify(token, JwtHelper.secret);
      
      // Validar que el payload tenga la estructura esperada
      if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
        req.user = decoded as JwtPayload;
        next();
      } else {
        console.error('Token no tiene la estructura esperada:', decoded);
        res.status(403).json({ message: 'Token inválido - estructura incorrecta' });
        return;
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expirado' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(403).json({ message: 'Token inválido' });
      } else {
        res.status(403).json({ message: 'Error al procesar token' });
      }
      return;
    }
  }

  /**
   * Middleware para autorizar roles específicos
   */
  static authorize(...roles: RolUsuario[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      if (!roles.includes(req.user.rol)) {
        res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
        return;
      }

      next();
    };
  }

  /**
   * Middleware para verificar que el usuario pertenece a la misma casa de cambio
   */
  static verifyCasaDeCambio(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Si es administrador maestro, puede acceder a cualquier casa de cambio
    if (req.user.rol === RolUsuario.ADMINISTRADOR_MAESTRO) {
      next();
      return;
    }

    // Para otros roles, verificar que pertenecen a la misma casa de cambio
    const casaDeCambioId = req.params.casaDeCambioId || req.body.casa_de_cambio_id;
    
    if (casaDeCambioId && parseInt(casaDeCambioId) !== req.user.casa_de_cambio_id) {
      res.status(403).json({ message: 'No tiene acceso a esta casa de cambio' });
      return;
    }

    next();
  }

  /**
   * Verifica si el token está próximo a expirar
   */
  static isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded || !decoded.exp) return false;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      // Considera que expira pronto si quedan menos de 30 minutos
      return timeUntilExpiry < 1800;
    } catch (error) {
      return true;
    }
  }
}