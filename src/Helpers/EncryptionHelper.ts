import crypto from 'crypto';

export class EncryptionHelper {
  private static readonly algorithm = 'aes-256-cbc';
  private static readonly secretKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-characters';

  /**
   * Encripta un texto usando AES-256-CBC
   * @param text Texto a encriptar
   * @returns Texto encriptado
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencripta un texto usando AES-256-CBC
   * @param encryptedText Texto encriptado
   * @returns Texto desencriptado
   */
  static decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encrypted = textParts.join(':');
    
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Genera un hash SHA-256 de un texto
   * @param text Texto a hashear
   * @returns Hash SHA-256
   */
  static generateHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Genera un identificador único
   * @returns UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Genera un número de transacción único
   * @param prefix Prefijo para el número
   * @returns Número de transacción único
   */
  static generateTransactionNumber(prefix: string = 'TXN'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}