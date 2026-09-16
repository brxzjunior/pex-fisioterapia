import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AppointmentService } from './appointment.service.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  queryAppointmentsSchema,
} from './appointment.schema.js';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated.js';

export async function appointmentRoutes(app: FastifyInstance) {
  // Todas as rotas de atendimentos exigem autenticação
  app.addHook('preHandler', ensureAuthenticated);

  /**
   * POST /api/appointments
   * Agenda nova sessão
   */
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const body = createAppointmentSchema.parse(request.body);
    const appointment = await AppointmentService.create(userId, body);
    return reply.status(201).send(appointment);
  });

  /**
   * GET /api/appointments
   * Lista atendimentos com filtros de status e data
   */
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const query = queryAppointmentsSchema.parse(request.query);
    const appointments = await AppointmentService.list(userId, query);
    return reply.send(appointments);
  });

  /**
   * PATCH /api/appointments/:id e /api/appointments/:id/status
   * Atualiza status ou dados/notas de uma sessão
   */
  const handleUpdateAppointment = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = updateAppointmentSchema.parse(request.body);
    const updated = await AppointmentService.update(userId, id, body);
    return reply.send(updated);
  };

  app.patch('/:id', handleUpdateAppointment);
  app.patch('/:id/status', handleUpdateAppointment);
}
