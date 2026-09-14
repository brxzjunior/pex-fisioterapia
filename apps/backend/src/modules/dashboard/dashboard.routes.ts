import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { DashboardService } from './dashboard.service.js';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated.js';

export async function dashboardRoutes(app: FastifyInstance) {
  // Todas as rotas de dashboard exigem autenticação
  app.addHook('preHandler', ensureAuthenticated);

  /**
   * GET /api/dashboard/stats
   * Retorna métricas consolidadas e próximos compromissos da profissional
   */
  app.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const data = await DashboardService.getStats(userId);
    return reply.send(data);
  });
}
