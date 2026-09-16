import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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
   * Lista de domínios descartáveis ou temporários bloqueados
   */
  private static BLOCKED_DOMAINS = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
    'throwawaymail.com', 'yopmail.com', 'sharklasers.com', 'dispostable.com',
    'trashmail.com', 'getairmail.com', 'fakeinbox.com'
  ];

  /**
   * Valida se o e-mail atende a critérios rigorosos de formato, TLD e não pertence a provedores descartáveis
   */
  static validateEmailPolicy(email: string): { valid: boolean; reason?: string } {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    
    if (!emailRegex.test(trimmed)) {
      return { valid: false, reason: 'Formato de e-mail inválido ou malformado.' };
    }

    const domain = trimmed.split('@')[1];
    if (this.BLOCKED_DOMAINS.includes(domain)) {
      return { valid: false, reason: 'E-mails temporários ou descartáveis não são permitidos por segurança.' };
    }

    const parts = domain.split('.');
    if (parts.length < 2) {
      return { valid: false, reason: 'Domínio de e-mail incompleto.' };
    }

    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      return { valid: false, reason: 'Extensão de domínio de e-mail inválida.' };
    }

    // Domínios fictícios comuns bloqueados
    const blockedGeneric = ['teste.com', 'test.com', 'exemplo.com', 'example.com', 'eu.com', 'voce.com'];
    if (blockedGeneric.includes(domain)) {
      return { valid: false, reason: 'Domínio fictício ou de teste não permitido.' };
    }

    return { valid: true };
  }

  /**
   * Gera código numérico de 6 dígitos para verificação de e-mail (válido por 15 minutos)
   */
  static generateVerificationCode(): { code: string; expires: Date } {
    // Código de 6 dígitos criptograficamente seguro
    const code = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos
    return { code, expires };
  }

  /**
   * Validação robusta de complexidade de senha:
   * Mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.
   */
  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('A senha deve conter no mínimo 8 caracteres.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula (A-Z).');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula (a-z).');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número (0-9).');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&* etc.).');
    }

    // Bloqueia senhas com sequências óbvias
    const weakPatterns = ['12345678', 'password', 'senha123', 'admin123', 'qwertyuiop'];
    if (weakPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      errors.push('A senha é muito fraca e contém sequências óbvias.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Hasheia senha com salt bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compara senha em texto com hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Gera token aleatório para recuperação de senha
   */
  static generateResetToken(): { token: string; expires: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora de validade
    return { token, expires };
  }

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
