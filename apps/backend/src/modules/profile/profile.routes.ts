import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../shared/database/prisma.js';
import { ensureAuthenticated } from '../../shared/middlewares/ensureAuthenticated.js';

const updateProfileSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  phone: z.string().optional().nullable(),
  professionalBio: z.string().optional().nullable(),
  specialties: z.string().optional().nullable(),
});

export async function profileRoutes(app: FastifyInstance) {
  /**
   * GET /api/profile/public
   * Rota pública para alimentar a landing page com dados reais da fisioterapeuta
   */
  app.get('/public', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const professional = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          phone: true,
          professionalBio: true,
          specialties: true,
        },
      });

      if (!professional) {
        return reply.send({
          name: 'Dra. Fisioterapeuta',
          phone: '(11) 99999-8888',
          professionalBio: 'Fisioterapeuta especializada em reabilitação ortopédica, desportiva e pilates clínico com atendimento individualizado e humanizado.',
          specialties: 'Ortopedia, Fisioterapia Esportiva, Pilates Clínico, Reeducação Postural',
        });
      }

      return reply.send(professional);
    } catch (err) {
      return reply.send({
        name: 'Dra. Fisioterapeuta',
        phone: '(11) 99999-8888',
        professionalBio: 'Fisioterapeuta especializada em reabilitação ortopédica, desportiva e pilates clínico com atendimento individualizado.',
        specialties: 'Ortopedia, Fisioterapia Esportiva, Pilates Clínico, Reeducação Postural',
      });
    }
  });

  /**
   * PUT /api/profile
   * Atualiza os dados do perfil profissional autenticado
   */
  app.put('/', { preHandler: [ensureAuthenticated] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.sub;
    const body = updateProfileSchema.parse(request.body);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        phone: body.phone,
        professionalBio: body.professionalBio,
        specialties: body.specialties,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        professionalBio: true,
        specialties: true,
        role: true,
      },
    });

    return reply.send(updated);
  });
}
