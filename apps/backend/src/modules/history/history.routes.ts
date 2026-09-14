import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../shared/database/prisma.js';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated.js';

export async function historyRoutes(app: FastifyInstance) {
  app.addHook('preHandler', ensureAuthenticated);

  /**
   * GET /api/history
   * Retorna os últimos 50 eventos administrativos do profissional
   */
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;

    const entries = await prisma.patientHistory.findMany({
      where: { userId },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reply.send(entries);
  });
}
