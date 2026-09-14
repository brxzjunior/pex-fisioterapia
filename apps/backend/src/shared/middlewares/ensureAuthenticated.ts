import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService, UserTokenPayload } from '../../modules/auth/auth.service.js';
import { AppError } from '../errors/AppError.js';

// Estende a tipagem do FastifyRequest para incluir o usuário decodificado
declare module 'fastify' {
  interface FastifyRequest {
    user?: UserTokenPayload;
  }
}

export async function ensureAuthenticated(request: FastifyRequest, reply: FastifyReply) {
  // Busca o token do cookie assinado ou do header Authorization (Bearer)
  const cookieToken = request.cookies[AuthService.COOKIE_NAME];
  let token: string | undefined = cookieToken;

  if (!token && request.headers.authorization) {
    const [scheme, bearerToken] = request.headers.authorization.split(' ');
    if (scheme === 'Bearer') {
      token = bearerToken;
    }
  }

  if (!token) {
    throw new AppError('Sessão não encontrada ou expirada. Faça login novamente.', 401, 'UNAUTHORIZED');
  }

  try {
    const decoded = AuthService.verifyToken(token);
    request.user = decoded;
  } catch (err) {
    throw new AppError('Token de sessão inválido ou expirado.', 401, 'INVALID_TOKEN');
  }
}
