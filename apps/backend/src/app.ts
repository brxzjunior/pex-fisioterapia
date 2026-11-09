import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import { env } from './config/env.js';
import { errorHandler } from './shared/errors/errorHandler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { patientRoutes } from './modules/patients/patient.routes.js';
import { appointmentRoutes } from './modules/appointments/appointment.routes.js';
import { activityRoutes } from './modules/activities/activity.routes.js';
import { historyRoutes } from './modules/history/history.routes.js';
import { profileRoutes } from './modules/profile/profile.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';

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

  // CORS configurado para aceitar frontend local, produção e deploys Vercel
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        return cb(null, true);
      }
      return cb(new Error('Origem não permitida pelo CORS'), false);
    },
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
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await app.register(patientRoutes, { prefix: '/api/patients' });
  await app.register(appointmentRoutes, { prefix: '/api/appointments' });
  await app.register(activityRoutes, { prefix: '/api/activities' });
  await app.register(historyRoutes, { prefix: '/api/history' });
  await app.register(profileRoutes, { prefix: '/api/profile' });
  await app.register(analyticsRoutes, { prefix: '/api/analytics' });

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
