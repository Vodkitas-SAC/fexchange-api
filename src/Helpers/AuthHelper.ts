import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Usuario } from '../DbModel/Entities/Usuario';

export class AuthHelper {
  /**
   * Encripta una contraseña usando bcrypt
   * @param password Contraseña en texto plano
   * @returns Contraseña encriptada
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compara una contraseña en texto plano con una encriptada
   * @param password Contraseña en texto plano
   * @param hashedPassword Contraseña encriptada
   * @returns true si las contraseñas coinciden
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Genera un token JWT para un usuario
   * @param usuario Usuario para generar el token
   * @returns Token JWT
   */
  static generateToken(usuario: Usuario): string {
    const payload = {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      casa_de_cambio_id: usuario.casa_de_cambio_id,
    };

    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const expiresIn = process.env.JWT_EXPIRE || '24h';

    const options: SignOptions = {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, secret, options);
  }

  /**
   * Verifica un token JWT
   * @param token Token JWT a verificar
   * @returns Payload del token si es válido
   */
  static verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    return jwt.verify(token, secret);
  }

  /**
   * Extrae el token del header Authorization
   * @param authHeader Header Authorization
   * @returns Token sin el prefijo 'Bearer '
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}