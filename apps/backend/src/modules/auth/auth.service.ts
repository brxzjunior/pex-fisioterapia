import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface UserTokenPayload {
  sub: string; // User ID
  email: string;
  name: string;
  role: string;
}

export class AuthService {
  private static TOKEN_EXPIRATION = '7d'; // 7 dias de validade
  public static COOKIE_NAME = 'fisio_session';

  /**
   * Gera um token JWT assinado para o usuário autenticado
   */
  static generateToken(payload: UserTokenPayload): string {
    return jwt.sign(payload, env.SESSION_SECRET, {
      expiresIn: this.TOKEN_EXPIRATION,
    });
  }

  /**
   * Valida a integridade e expiração do token JWT
   */
  static verifyToken(token: string): UserTokenPayload {
    return jwt.verify(token, env.SESSION_SECRET) as UserTokenPayload;
  }

  /**
   * Monta a URL de redirecionamento oficial para o Google OAuth 2.0
   */
  static getGoogleAuthUrl(): string {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      client_id: env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }
}
