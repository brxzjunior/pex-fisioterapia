import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ActivityService } from './activity.service.js';
import {
  createActivitySchema,
  updateActivitySchema,
  queryActivitiesSchema,
} from './activity.schema.js';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated.js';

export async function activityRoutes(app: FastifyInstance) {
  app.addHook('preHandler', ensureAuthenticated);

  /**
   * POST /api/activities
   * Cria nova tarefa
   */
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const body = createActivitySchema.parse(request.body);
    const activity = await ActivityService.create(userId, body);
    return reply.status(201).send(activity);
  });

  /**
   * GET /api/activities
   * Lista tarefas com filtros de status e prioridade
   */
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const query = queryActivitiesSchema.parse(request.query);
    const activities = await ActivityService.list(userId, query);
    return reply.send(activities);
  });

  /**
   * PATCH /api/activities/:id
   * Atualiza ou conclui tarefa
   */
  app.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = updateActivitySchema.parse(request.body);
    const updated = await ActivityService.update(userId, id, body);
    return reply.send(updated);
  });

  /**
   * DELETE /api/activities/:id
   * Exclui tarefa
   */
  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const result = await ActivityService.delete(userId, id);
    return reply.send(result);
  });
}
