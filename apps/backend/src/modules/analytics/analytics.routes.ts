import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AnalyticsService } from './analytics.service.js';

export async function analyticsRoutes(app: FastifyInstance) {
  /**
   * POST /api/analytics/track
   * Registro anônimo de telemetria da Landing Page
   */
  app.post('/track', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      event: z.enum(['PAGE_VIEW', 'WHATSAPP_CLICK']),
    }).safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: 'Evento inválido' });
    }

    const metrics = AnalyticsService.track(body.data.event);
    return reply.send({ success: true, metrics });
  });

  /**
   * GET /api/analytics/metrics
   * Consulta pública/gerencial das métricas da Landing Page
   */
  app.get('/metrics', async (_request: FastifyRequest, reply: FastifyReply) => {
    const metrics = AnalyticsService.getMetrics();
    return reply.send(metrics);
  });
}

