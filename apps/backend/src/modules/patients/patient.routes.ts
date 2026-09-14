import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PatientService } from './patient.service.js';
import { createPatientSchema, updatePatientSchema, queryPatientsSchema } from './patient.schema.js';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated.js';

export async function patientRoutes(app: FastifyInstance) {
  // Todas as rotas de pacientes exigem autenticação
  app.addHook('preHandler', ensureAuthenticated);

  /**
   * POST /api/patients
   * Cadastra novo paciente
   */
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const body = createPatientSchema.parse(request.body);
    const patient = await PatientService.create(userId, body);
    return reply.status(201).send(patient);
  });

  /**
   * GET /api/patients
   * Lista pacientes com suporte a busca e filtros
   */
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const query = queryPatientsSchema.parse(request.query);
    const patients = await PatientService.list(userId, query);
    return reply.send(patients);
  });

  /**
   * GET /api/patients/:id
   * Detalhes de um paciente específico (com histórico e sessões)
   */
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const patient = await PatientService.getById(userId, id);
    return reply.send(patient);
  });

  /**
   * PUT /api/patients/:id
   * Atualiza dados de um paciente
   */
  app.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = updatePatientSchema.parse(request.body);
    const updated = await PatientService.update(userId, id, body);
    return reply.send(updated);
  });

  /**
   * PATCH /api/patients/:id/toggle-status
   * Alterna status entre Ativo e Inativo
   */
  app.patch('/:id/toggle-status', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const updated = await PatientService.toggleStatus(userId, id);
    return reply.send(updated);
  });
}
