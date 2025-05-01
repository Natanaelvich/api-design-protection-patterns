import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export class JwtUtils {
  static generateToken(payload: object, expiresIn = '1h'): string {
    return jwt.sign(payload, env.JWT_SECRET, { 
      expiresIn: expiresIn as jwt.SignOptions['expiresIn']
    });
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}