import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta'; // fallback for development

export class JwtUtils {
  static generateToken(payload: object, expiresIn = '1h'): string {
    return jwt.sign(payload, SECRET_KEY, { 
      expiresIn: expiresIn as jwt.SignOptions['expiresIn']
    });
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (error) {
      return null;
    }
  }
}