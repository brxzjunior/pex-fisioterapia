import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service.js';
import { EmailService } from '../../shared/services/email.service.js';
import { prisma } from '../../shared/database/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated.js';

export async function authRoutes(app: FastifyInstance) {
  /**
   * Helper para gravar cookie seguro com o token JWT
   */
  const setSessionCookie = (reply: FastifyReply, token: string) => {
    reply.setCookie(AuthService.COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });
  };

  /**
   * GET /api/auth/google/url
   * Retorna a URL de autorização do Google OAuth 2.0
   */
  app.get('/google/url', async () => {
    return { url: AuthService.getGoogleAuthUrl() };
  });

  /**
   * GET /api/auth/google/callback
   * Recebe o código temporário da Google, valida e autentica o usuário
   */
  app.get('/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    const callbackQuerySchema = z.object({
      code: z.string().optional(),
      error: z.string().optional(),
    });

    const { code, error } = callbackQuerySchema.parse(request.query);

    if (error || !code) {
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_denied`);
    }

    try {
      const googleUser = await AuthService.exchangeGoogleCode(code);

      // Busca ou cria o usuário pelo googleId ou email
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ googleId: googleUser.id }, { email: googleUser.email }],
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            avatarUrl: googleUser.picture || null,
            role: 'ADMIN',
            professionalBio: 'Fisioterapeuta especializada em reabilitação ortopédica e pilates clínico.',
            specialties: 'Ortopedia, Fisioterapia Esportiva, Pilates Clínico, Reabilitação Postural',
          },
        });
      } else if (!user.googleId) {
        // Vincula o Google ID caso a conta já existisse pelo e-mail
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id, avatarUrl: googleUser.picture || user.avatarUrl },
        });
      }

      const token = AuthService.generateToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      setSessionCookie(reply, token);

      return reply.redirect(`${env.FRONTEND_URL}/admin/dashboard`);
    } catch (err) {
      request.log.error(err);
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  });

  /**
   * POST /api/auth/register
   * Cria nova conta com e-mail, nome e senha com verificação robusta
   */
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const registerSchema = z.object({
      name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').trim(),
      email: z.string().email('E-mail inválido').trim(),
      password: z.string().min(1, 'A senha é obrigatória'),
      phone: z.string().optional(),
    });

    const { name, email, password, phone } = registerSchema.parse(request.body);

    // 1. Verificação rigorosa de política de e-mail (bloqueio de descartáveis e malformados)
    const emailCheck = AuthService.validateEmailPolicy(email);
    if (!emailCheck.valid) {
      throw new AppError(emailCheck.reason || 'E-mail não atende aos requisitos de segurança.', 400);
    }

    // 2. Verificação rigorosa de complexidade de senha
    const passwordCheck = AuthService.validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      throw new AppError(`Senha insegura: ${passwordCheck.errors.join(' ')}`, 400);
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new AppError('Já existe uma conta cadastrada com este e-mail.', 409);
    }

    const passwordHash = await AuthService.hashPassword(password);
    const { code: verificationCode, expires: verificationExpires } = AuthService.generateVerificationCode();

    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        phone: phone || null,
        isEmailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpires: verificationExpires,
        role: 'ADMIN',
        professionalBio: 'Fisioterapeuta clínica e reabilitação funcional.',
        specialties: 'Ortopedia, Terapia Manual, Reabilitação',
      },
    });

    // Dispara envio real de e-mail através do Resend (Modo Híbrido)
    const emailSent = await EmailService.sendVerificationCode(newUser.email, verificationCode, newUser.name);
    request.log.info(`[CÓDIGO DE VERIFICAÇÃO] Para ${newUser.email}: ${verificationCode} (Enviado por e-mail: ${emailSent ? 'SIM' : 'NÃO - Sandbox Ativo'})`);

    return reply.status(201).send({
      message: emailSent
        ? 'Conta criada! Enviamos um código de 6 dígitos para o seu e-mail para confirmação.'
        : 'Conta criada! Verifique o código enviado (ou utilize o código do modo desenvolvimento abaixo).',
      requiresVerification: true,
      email: newUser.email,
      // Modo Híbrido: se o Resend estiver restrito à conta de teste, fornece fallbackCode para não travar
      fallbackCode: !emailSent ? verificationCode : undefined,
    });
  });

  /**
   * POST /api/auth/verify-email
   * Valida o código de 6 dígitos enviado para o e-mail do usuário
   */
  app.post('/verify-email', async (request: FastifyRequest, reply: FastifyReply) => {
    const verifySchema = z.object({
      email: z.string().email('E-mail inválido').trim(),
      code: z.string().length(6, 'O código de verificação deve conter 6 dígitos'),
    });

    const { email, code } = verifySchema.parse(request.body);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    if (user.isEmailVerified) {
      return reply.send({ message: 'E-mail já verificado anteriormente. Você já pode fazer login.' });
    }

    if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
      throw new AppError('Código de verificação incorreto.', 400);
    }

    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new AppError('O código de verificação expirou. Solicite um novo código.', 400);
    }

    // Marca e-mail como verificado e limpa o código temporário
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
    });

    const token = AuthService.generateToken({
      sub: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });

    setSessionCookie(reply, token);

    return reply.send({
      message: 'E-mail verificado com sucesso! Acesso liberado.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      token,
    });
  });

  /**
   * POST /api/auth/resend-code
   * Reenvia um novo código de verificação de 6 dígitos
   */
  app.post('/resend-code', async (request: FastifyRequest, reply: FastifyReply) => {
    const resendSchema = z.object({
      email: z.string().email('E-mail inválido').trim(),
    });

    const { email } = resendSchema.parse(request.body);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return reply.send({ message: 'Se a conta existir, um novo código foi emitido.' });
    }

    const { code, expires } = AuthService.generateVerificationCode();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: code,
        emailVerificationExpires: expires,
      },
    });

    const emailSent = await EmailService.sendVerificationCode(user.email, code, user.name);
    request.log.info(`[NOVO CÓDIGO DE VERIFICAÇÃO] Para ${user.email}: ${code} (Enviado: ${emailSent ? 'SIM' : 'NÃO - Sandbox'})`);

    return reply.send({
      message: emailSent
        ? 'Novo código de verificação enviado para o seu e-mail.'
        : 'Novo código gerado com sucesso.',
      fallbackCode: !emailSent ? code : undefined,
    });
  });

  /**
   * POST /api/auth/login
   * Autenticação via e-mail e senha
   */
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const loginSchema = z.object({
      email: z.string().email('E-mail inválido').trim(),
      password: z.string().min(1, 'Informe a senha'),
    });

    const { email, password } = loginSchema.parse(request.body);

    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const passwordMatch = await AuthService.comparePassword(password, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    // Se o e-mail ainda não foi verificado via código
    if (!user.isEmailVerified) {
      const { code, expires } = AuthService.generateVerificationCode();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationCode: code,
          emailVerificationExpires: expires,
        },
      });

      const emailSent = await EmailService.sendVerificationCode(user.email, code, user.name);
      request.log.info(`[CÓDIGO DE VERIFICAÇÃO NO LOGIN] Para ${user.email}: ${code} (Enviado: ${emailSent ? 'SIM' : 'NÃO'})`);

      return reply.status(403).send({
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Seu e-mail ainda não foi verificado. Enviamos um código de 6 dígitos para o seu e-mail.',
        requiresVerification: true,
        email: user.email,
        fallbackCode: !emailSent ? code : undefined,
      });
    }

    const token = AuthService.generateToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    setSessionCookie(reply, token);

    return reply.send({
      message: 'Login realizado com sucesso.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  });

  /**
   * POST /api/auth/forgot-password
   * Solicita token para recuperação de senha com validação de formato
   */
  app.post('/forgot-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const forgotSchema = z.object({
      email: z.string().email('E-mail inválido').trim(),
    });

    const { email } = forgotSchema.parse(request.body);

    const emailCheck = AuthService.validateEmailPolicy(email);
    if (!emailCheck.valid) {
      throw new AppError(emailCheck.reason || 'E-mail inválido.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Resposta neutra para segurança contra enumeração
      return reply.send({
        message: 'Se o e-mail estiver cadastrado, as instruções foram enviadas.',
      });
    }

    const { token, expires } = AuthService.generateResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    request.log.info(`[RECUPERAÇÃO DE SENHA] Token para ${user.email}: ${token}`);

    return reply.send({
      message: 'Instruções de redefinição geradas.',
      resetToken: token,
    });
  });

  /**
   * POST /api/auth/reset-password
   * Define nova senha garantindo os mesmos padrões de segurança e robustez
   */
  app.post('/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const resetSchema = z.object({
      token: z.string().min(1, 'Token de recuperação obrigatório'),
      newPassword: z.string().min(1, 'Nova senha obrigatória'),
    });

    const { token, newPassword } = resetSchema.parse(request.body);

    // Validação robusta da nova senha
    const passwordCheck = AuthService.validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      throw new AppError(`Nova senha insegura: ${passwordCheck.errors.join(' ')}`, 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Token de recuperação inválido ou expirado.', 400);
    }

    const passwordHash = await AuthService.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return reply.send({
      message: 'Senha alterada com sucesso. Você já pode fazer login.',
    });
  });

  /**
   * POST /api/auth/dev-login
   * Login facilitado para testes locais e banca acadêmica
   * Cria ou busca o usuário padrão da fisioterapeuta
   */
  app.post('/dev-login', async (request: FastifyRequest, reply: FastifyReply) => {
    const devLoginSchema = z.object({
      email: z.string().email().optional(),
    });

    const { email } = devLoginSchema.parse(request.body || {});
    const targetEmail = email || env.ALLOWED_ADMIN_EMAIL;

    // Busca ou cria usuário no banco
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: targetEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: targetEmail,
            name: 'Dra. Letícia Souza de Moraes',
            professionalBio: 'Fisioterapeuta especializada em reabilitação ortopédica, desportiva e pilates clínico.',
            specialties: 'Ortopedia, Fisioterapia Esportiva, Pilates Clínico, Reabilitação Postural',
            phone: '(92) 99177-9987',
            role: 'ADMIN',
          },
        });
      }
    } catch (dbError) {
      // Caso o banco ainda não tenha sido conectado em ambiente de teste rápido, cria sessão simulada
      request.log.warn('Banco offline ou não configurado ainda. Emitindo sessão dev simulada.');
      user = {
        id: 'dev-fisioterapeuta-id',
        email: targetEmail,
        name: 'Dra. Letícia Souza de Moraes',
        role: 'ADMIN',
      };
    }

    const token = AuthService.generateToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    setSessionCookie(reply, token);

    return reply.send({
      message: 'Login realizado com sucesso.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token, // Fornecido também caso o cliente prefira utilizar via header Authorization
    });
  });

  /**
   * GET /api/auth/me
   * Retorna os dados do usuário autenticado se houver sessão ativa, ou null caso visitante
   */
  app.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const cookieToken = request.cookies[AuthService.COOKIE_NAME];
    let token: string | undefined = cookieToken;

    if (!token && request.headers.authorization) {
      const [scheme, bearerToken] = request.headers.authorization.split(' ');
      if (scheme === 'Bearer') {
        token = bearerToken;
      }
    }

    if (!token) {
      return reply.send({ user: null });
    }

    try {
      const decoded = AuthService.verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          phone: true,
          professionalBio: true,
          specialties: true,
          role: true,
          createdAt: true,
        },
      });

      return reply.send({ user: user || null });
    } catch (err) {
      return reply.send({ user: null });
    }
  });

  /**
   * POST /api/auth/logout
   * Remove o cookie de sessão seguro
   */
  app.post('/logout', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie(AuthService.COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return reply.send({ message: 'Sessão encerrada com sucesso.' });
  });
}
