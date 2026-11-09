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
  /**
   * POST /api/appointments/reminders/webhook
   * Webhook público de recepção de confirmações e respostas do WhatsApp (versão 2.0)
   */
  app.post('/reminders/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.body as any;
    const result = await AppointmentService.handleWebhookNotification(payload || {});
    return reply.send(result);
  });

  // Rotas de atendimento exigem autenticação do profissional
  app.addHook('preHandler', async (request, reply) => {
    if (request.url.includes('/reminders/webhook')) return;
    await ensureAuthenticated(request, reply);
  });

  /**
   * POST /api/appointments/reminders/broadcast
   * Disparo automatizado de lembretes prévios das próximas 24h
   */
  app.post('/reminders/broadcast', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const result = await AppointmentService.broadcastUpcomingReminders(userId);
    return reply.send(result);
  });

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

  /**
   * DELETE /api/appointments/:id
   * Remove permanentemente uma sessão
   */
  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const result = await AppointmentService.delete(userId, id);
    return reply.send(result);
  });

  /**
   * POST /api/appointments/:id/reminder
   * Registra disparo de lembrete via WhatsApp no histórico
   */
  app.post('/:id/reminder', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({ messagePreview: z.string().optional() }).safeParse(request.body);
    const result = await AppointmentService.registerReminder(
      userId,
      id,
      body.success ? body.data.messagePreview : undefined
    );
    return reply.send(result);
  });
}

