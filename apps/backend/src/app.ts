import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import { env } from './config/env.js';
import { errorHandler } from './shared/errors/errorHandler.js';

export async function buildApp() {
  const app = fastify({
    logger: env.NODE_ENV === 'development',
  });

  // Headers de segurança HTTP
  await app.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  // Gerenciamento de cookies
  await app.register(cookie, {
    secret: env.SESSION_SECRET,
    parseOptions: {},
  });

  // CORS restrito à origem do frontend
  await app.register(cors, {
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Prevenção contra abusos e força bruta
  await app.register(rateLimit, {
    max: 120, // Máximo de 120 requisições por minuto por IP
    timeWindow: '1 minute',
  });

  // Global Error Handler
  app.setErrorHandler(errorHandler);

  // Registro dos módulos de rotas
  await app.register(import('./modules/auth/auth.routes.js').then(m => m.authRoutes), {
    prefix: '/api/auth',
  });

  await app.register(import('./modules/dashboard/dashboard.routes.js').then(m => m.dashboardRoutes), {
    prefix: '/api/dashboard',
  });

  await app.register(import('./modules/patients/patient.routes.js').then(m => m.patientRoutes), {
    prefix: '/api/patients',
  });

  await app.register(import('./modules/appointments/appointment.routes.js').then(m => m.appointmentRoutes), {
    prefix: '/api/appointments',
  });

  await app.register(import('./modules/activities/activity.routes.js').then(m => m.activityRoutes), {
    prefix: '/api/activities',
  });

  await app.register(import('./modules/history/history.routes.js').then(m => m.historyRoutes), {
    prefix: '/api/history',
  });

  await app.register(import('./modules/profile/profile.routes.js').then(m => m.profileRoutes), {
    prefix: '/api/profile',
  });

  // Health check básico da aplicação
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      system: 'FisioPro API',
    };
  });

  return app;
}
