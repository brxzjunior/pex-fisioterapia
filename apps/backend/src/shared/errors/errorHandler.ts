import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './AppError.js';
import { env } from '../../config/env.js';

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  // 1. Erros de validação Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Dados de entrada inválidos.',
      issues: error.format(),
    });
  }

  // 2. Erros operacionais conhecidos da aplicação
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: 'Application Error',
      code: error.code,
      message: error.message,
    });
  }

  // 3. Erros do Fastify com statusCode
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name || 'Fastify Error',
      message: error.message,
    });
  }

  // 4. Erros não esperados (500) - Sanitização para não expor detalhes em produção
  request.log.error(error);

  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'production' 
      ? 'Ocorreu um erro interno nos nossos servidores. Tente novamente mais tarde.' 
      : error.message,
  });
}
