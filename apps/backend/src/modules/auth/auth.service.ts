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

  /**
   * Troca o código temporário recebido da Google pelo token de acesso e dados do perfil
   */
  static async exchangeGoogleCode(code: string): Promise<{ id: string; email: string; name: string; picture?: string }> {
    // 1. Troca o código temporário pelo token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Erro ao trocar código com o Google:', errText);
      throw new Error('Falha ao autenticar com o Google.');
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string; id_token: string };

    // 2. Busca os dados do usuário autenticado usando o access_token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error('Falha ao obter perfil do usuário no Google.');
    }

    return (await userResponse.json()) as { id: string; email: string; name: string; picture?: string };
  }
}
