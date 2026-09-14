import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service.js';
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
            name: 'Dra. Fisioterapeuta',
            professionalBio: 'Fisioterapeuta especializada em reabilitação ortopédica, desportiva e pilates clínico.',
            specialties: 'Ortopedia, Fisioterapia Esportiva, Pilates Clínico, Reabilitação Postural',
            phone: '(11) 99999-8888',
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
        name: 'Dra. Fisioterapeuta (Modo Acadêmico)',
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
   * Retorna os dados do usuário autenticado a partir do token de sessão
   */
  app.get('/me', { preHandler: [ensureAuthenticated] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPayload = request.user!;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userPayload.sub },
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

      if (!user) {
        return reply.send({ user: userPayload });
      }

      return reply.send({ user });
    } catch (err) {
      return reply.send({ user: userPayload });
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
